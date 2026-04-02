import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = String(import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim();
const PAYPAL_CURRENCY = String(import.meta.env.VITE_PAYPAL_CURRENCY || "USD").trim() || "USD";

const PAYPAL_OPTIONS = Object.freeze({
  clientId: PAYPAL_CLIENT_ID,
  currency: PAYPAL_CURRENCY,
  intent: "capture",
});

export const isPayPalConfigured = Boolean(PAYPAL_CLIENT_ID);

const PayPalProvider = ({ children }) => {
  if (!isPayPalConfigured) {
    return null;
  }

  return <PayPalScriptProvider options={PAYPAL_OPTIONS}>{children}</PayPalScriptProvider>;
};

export default PayPalProvider;
