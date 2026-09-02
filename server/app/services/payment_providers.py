import base64
import json
import os
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


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
    return all(os.environ.get(name) for name in names)


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
            "CallBackURL": os.environ["MPESA_CALLBACK_URL"],
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


def _paypal_access_token():
    client_id = os.environ.get("PAYPAL_CLIENT_ID")
    client_secret = os.environ.get("PAYPAL_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None, None
    environment = os.environ.get("PAYPAL_ENVIRONMENT", "sandbox")
    base_url = "https://api-m.paypal.com" if environment == "production" else "https://api-m.sandbox.paypal.com"
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    request = Request(
        f"{base_url}/v1/oauth2/token",
        data=b"grant_type=client_credentials",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=20) as response:
            token = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError) as error:
        raise PaymentProviderError(f"PayPal token request failed: {error}") from error
    return base_url, token["access_token"]


def create_paypal_order(donation):
    base_url, token = _paypal_access_token()
    if not token:
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
    result = _request(
        f"{base_url}/v2/checkout/orders",
        method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        payload=payload,
    )
    approval = next((link["href"] for link in result.get("links", []) if link.get("rel") == "approve"), None)
    return {
        "status": "pending",
        "next_action": "approve_paypal_order",
        "provider_reference": result.get("id"),
        "approval_url": approval,
    }


def capture_paypal_order(provider_reference):
    base_url, token = _paypal_access_token()
    if not token:
        raise PaymentProviderError("PayPal is not configured.")
    result = _request(
        f"{base_url}/v2/checkout/orders/{provider_reference}/capture",
        method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        payload={},
    )
    return result.get("status") == "COMPLETED"


def initiate_payment(donation, phone_number=None):
    if donation.payment_method == "mpesa":
        return initiate_mpesa(donation, phone_number)
    if donation.payment_method == "paypal":
        return create_paypal_order(donation)
    raise PaymentProviderError("Unsupported payment method.")
