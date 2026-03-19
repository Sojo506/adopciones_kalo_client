import axiosInstance from "./axiosConfig";
import { clearInvoiceCaches } from "./invoices";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let paypalPaymentsCache = null;
const paypalPaymentDetailCache = new Map();

const buildPayPalPaymentPath = (idPago) => `/paypal-payments/${idPago}`;

export const clearPayPalPaymentCaches = (idPago) => {
  paypalPaymentsCache = null;

  if (idPago !== undefined && idPago !== null) {
    paypalPaymentDetailCache.delete(String(idPago));
    return;
  }

  paypalPaymentDetailCache.clear();
};

const invalidateRelatedCaches = (idPago, idFactura) => {
  clearPayPalPaymentCaches(idPago);
  clearInvoiceCaches(idFactura);
};

export const getPayPalPayments = async ({ force = false } = {}) => {
  if (!force && paypalPaymentsCache) {
    return paypalPaymentsCache;
  }

  return dedupeRequest("paypal-payments:list", async () => {
    const response = await axiosInstance.get("/paypal-payments");
    paypalPaymentsCache = unwrapResponse(response);
    return paypalPaymentsCache;
  });
};

export const getPayPalPaymentById = async (idPago, { force = false } = {}) => {
  const cacheKey = String(idPago);

  if (!force && paypalPaymentDetailCache.has(cacheKey)) {
    return paypalPaymentDetailCache.get(cacheKey);
  }

  return dedupeRequest(`paypal-payments:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildPayPalPaymentPath(idPago));
    const data = unwrapResponse(response);
    paypalPaymentDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createPayPalPayment = async (payload) => {
  const response = await axiosInstance.post("/paypal-payments", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idPago, data?.idFactura);
  return data;
};

export const updatePayPalPayment = async (idPago, payload) => {
  const response = await axiosInstance.put(buildPayPalPaymentPath(idPago), payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idPago, data?.idFactura);
  paypalPaymentDetailCache.set(String(idPago), data);
  return data;
};

export const deletePayPalPayment = async (idPago) => {
  const response = await axiosInstance.delete(buildPayPalPaymentPath(idPago));
  clearPayPalPaymentCaches(idPago);
  return unwrapResponse(response);
};
