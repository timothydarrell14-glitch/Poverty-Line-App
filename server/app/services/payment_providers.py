import base64
import json
import os
from urllib.parse import urlencode, urlsplit, urlunsplit, parse_qsl
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from paypalserversdk.configuration import Environment
from paypalserversdk.http.auth.o_auth_2 import ClientCredentialsAuthCredentials
from paypalserversdk.paypal_serversdk_client import PaypalServersdkClient


class PaymentProviderError(Exception):
    pass


def _request(url, method="GET", payload=None, headers=None):
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as error:
        raise PaymentProviderError(f"Payment provider request failed: {error}") from error


def _configured(*names):
    return all(
        os.environ.get(name)
        and os.environ.get(name).strip().upper() not in {"N/A", "NA", "NONE"}
        and not os.environ.get(name).strip().lower().startswith("replace-with-")
        for name in names
    )


def initiate_mpesa(donation, phone_number):
    required = ("MPESA_CONSUMER_KEY", "MPESA_CONSUMER_SECRET", "MPESA_SHORTCODE", "MPESA_PASSKEY", "MPESA_CALLBACK_URL")
    if not _configured(*required):
        return {"status": "pending", "next_action": "configure_provider"}
    if not phone_number:
        raise PaymentProviderError("A phone number is required for M-Pesa payments.")

    environment = os.environ.get("MPESA_ENVIRONMENT", "sandbox")
    base_url = "https://api.safaricom.co.ke" if environment == "production" else "https://sandbox.safaricom.co.ke"
    credentials = base64.b64encode(
        f"{os.environ['MPESA_CONSUMER_KEY']}:{os.environ['MPESA_CONSUMER_SECRET']}".encode()
    ).decode()
    token = _request(
        f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
        headers={"Authorization": f"Basic {credentials}"},
    )["access_token"]
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{os.environ['MPESA_SHORTCODE']}{os.environ['MPESA_PASSKEY']}{timestamp}".encode()
    ).decode()
    callback_url = os.environ["MPESA_CALLBACK_URL"]
    callback_token = os.environ.get("MPESA_CALLBACK_TOKEN")
    if callback_token:
        parts = urlsplit(callback_url)
        query = dict(parse_qsl(parts.query))
        query["token"] = callback_token
        callback_url = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))
    result = _request(
        f"{base_url}/mpesa/stkpush/v1/processrequest",
        method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        payload={
            "BusinessShortCode": os.environ["MPESA_SHORTCODE"],
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(donation.amount),
            "PartyA": phone_number.replace("+", ""),
            "PartyB": os.environ["MPESA_SHORTCODE"],
            "PhoneNumber": phone_number.replace("+", ""),
            "CallBackURL": callback_url,
            "AccountReference": f"DONATION-{donation.donation_id}",
            "TransactionDesc": "Poverty Line donation",
        },
    )
    return {
        "status": "pending",
        "next_action": "complete_stk_push",
        "provider_reference": result.get("CheckoutRequestID"),
        "message": result.get("CustomerMessage"),
    }


def _paypal_client():
    environment = (
        Environment.PRODUCTION
        if os.environ.get("PAYPAL_ENVIRONMENT", "sandbox") == "production"
        else Environment.SANDBOX
    )
    credentials = ClientCredentialsAuthCredentials(
        os.environ["PAYPAL_CLIENT_ID"], os.environ["PAYPAL_CLIENT_SECRET"]
    )
    return PaypalServersdkClient(
        environment=environment,
        client_credentials_auth_credentials=credentials,
    )


def _response_body(response):
    return getattr(response, "body", response)


def get_paypal_browser_safe_client_token():
    client_id = os.environ.get("PAYPAL_CLIENT_ID")
    client_secret = os.environ.get("PAYPAL_CLIENT_SECRET")
    if not _configured("PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"):
        return None
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    optional_form_parameters = {"response_type": "client_token"}
    domains = os.environ.get("PAYPAL_FASTLANE_DOMAINS", "")
    if domains.strip():
        optional_form_parameters["domains[]"] = ",".join(
            domain.strip() for domain in domains.split(",") if domain.strip()
        )
    try:
        response = _paypal_client().o_auth_authorization.request_token(
            {"authorization": f"Basic {credentials}"},
            optional_form_parameters,
        )
        return _response_body(response).access_token
    except Exception as error:
        raise PaymentProviderError(f"PayPal client token request failed: {error}") from error


def create_paypal_fastlane_order(payload):
    if not _configured("PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"):
        raise PaymentProviderError("PayPal is not configured.")
    try:
        response = _paypal_client().orders.create_order({"body": payload})
        result = _response_body(response)
        return result.to_dictionary() if hasattr(result, "to_dictionary") else result
    except Exception as error:
        raise PaymentProviderError(f"PayPal order creation failed: {error}") from error


def create_paypal_order(donation):
    if not _configured("PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"):
        return {"status": "pending", "next_action": "configure_provider"}
    currency = os.environ.get("PAYPAL_CURRENCY", "USD")
    if donation.currency != currency:
        raise PaymentProviderError(
            f"PayPal requires {currency} amounts. Convert before creating the order."
        )
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": str(donation.donation_id),
            "amount": {"currency_code": currency, "value": f"{donation.amount:.2f}"},
        }],
    }
    return_url = os.environ.get("PAYPAL_RETURN_URL")
    cancel_url = os.environ.get("PAYPAL_CANCEL_URL")
    if return_url and cancel_url:
        payload["application_context"] = {
            "return_url": f"{return_url}?donation_id={donation.donation_id}",
            "cancel_url": cancel_url,
        }
    try:
        response = _paypal_client().orders.create_order({"body": payload})
        result = _response_body(response)
        result = result.to_dictionary() if hasattr(result, "to_dictionary") else result
    except Exception as error:
        raise PaymentProviderError(f"PayPal order creation failed: {error}") from error
    approval = next((link["href"] for link in result.get("links", []) if link.get("rel") == "approve"), None)
    return {
        "status": "pending",
        "next_action": "approve_paypal_order",
        "provider_reference": result.get("id"),
        "approval_url": approval,
    }


def capture_paypal_order(provider_reference):
    if not _configured("PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"):
        raise PaymentProviderError("PayPal is not configured.")
    try:
        response = _paypal_client().orders.capture_order({"id": provider_reference, "body": {}})
        result = _response_body(response)
        return getattr(result, "status", None) == "COMPLETED"
    except Exception as error:
        raise PaymentProviderError(f"PayPal capture failed: {error}") from error


def initiate_payment(donation, phone_number=None):
    if donation.payment_method == "mpesa":
        return initiate_mpesa(donation, phone_number)
    if donation.payment_method == "paypal":
        return create_paypal_order(donation)
    raise PaymentProviderError("Unsupported payment method.")
