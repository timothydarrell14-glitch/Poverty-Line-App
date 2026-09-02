import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client";

const SDK_URL = "https://www.sandbox.paypal.com/web-sdk/v6/core";

const loadPayPalSdk = () => new Promise((resolve, reject) => {
  if (window.paypal) {
    resolve(window.paypal);
    return;
  }
  const script = document.createElement("script");
  script.async = true;
  script.src = SDK_URL;
  script.onload = () => resolve(window.paypal);
  script.onerror = () => reject(new Error("Could not load PayPal Fastlane."));
  document.head.appendChild(script);
});

export default function FastlaneCheckout({ amount, programId, onCompleted }) {
  const paymentContainer = useRef(null);
  const fastlaneRef = useRef(null);
  const paymentComponentRef = useRef(null);
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [guest, setGuest] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const [{ accessToken }, paypal] = await Promise.all([
          apiRequest("/api/donations/paypal-api/auth/browser-safe-client-token"),
          loadPayPalSdk(),
        ]);
        const sdk = await paypal.createInstance({
          clientToken: accessToken,
          pageType: "product-details",
          clientMetadataId: crypto.randomUUID(),
          components: ["fastlane"],
        });
        fastlaneRef.current = await sdk.createFastlane();
        if (!cancelled) setReady(true);
      } catch (error) {
        if (!cancelled) setMessage(error.message);
      }
    }
    initialize();
    return () => { cancelled = true; };
  }, []);

  async function lookupEmail(event) {
    event.preventDefault();
    setMessage("");
    try {
      const { customerContextId } = await fastlaneRef.current.identity.lookupCustomerByEmail(email);
      if (customerContextId) {
        const result = await fastlaneRef.current.identity.triggerAuthenticationFlow(customerContextId);
        if (result.authenticationState === "succeeded") {
          setMessage("Welcome back. Continue with your saved checkout details.");
        }
      } else {
        setGuest(true);
      }
      paymentComponentRef.current = await fastlaneRef.current.FastlanePaymentComponent({});
      await paymentComponentRef.current.render(paymentContainer.current);
      setPaymentReady(true);
    } catch (error) {
      setMessage(error.message || "Fastlane could not verify this email.");
    }
  }

  async function submitPayment() {
    setMessage("");
    try {
      const { id: paymentToken } = await paymentComponentRef.current.getPaymentToken();
      const order = await apiRequest("/api/donations/paypal-api/checkout/orders/create", {
        method: "POST",
        body: {
          intent: "CAPTURE",
          payment_source: { card: { single_use_token: paymentToken } },
          purchase_units: [{
            custom_id: programId ? String(programId) : "general",
            amount: { currency_code: "USD", value: Number(amount).toFixed(2) },
          }],
        },
      });
      const capture = await apiRequest("/api/donations/paypal-api/checkout/orders/capture", {
        method: "POST",
        body: { order_id: order.id },
      });
      onCompleted({ ...order, ...capture });
    } catch (error) {
      setMessage(error.message || "Fastlane payment could not be completed.");
    }
  }

  return (
    <div className="fastlane-checkout">
      <form onSubmit={lookupEmail}>
        <label htmlFor="fastlane-email">Email</label>
        <input id="fastlane-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <button type="submit" disabled={!ready}>Continue with PayPal Fastlane</button>
      </form>
      {guest && <p>Guest checkout is ready.</p>}
      <div ref={paymentContainer} />
      {paymentReady && <button type="button" onClick={submitPayment}>Pay with Fastlane</button>}
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
