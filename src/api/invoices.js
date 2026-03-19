import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let invoicesCache = null;
const invoiceDetailCache = new Map();

const encodeInvoiceId = (idFactura) => encodeURIComponent(String(idFactura));

export const clearInvoiceCaches = (idFactura) => {
  invoicesCache = null;

  if (idFactura !== undefined && idFactura !== null) {
    invoiceDetailCache.delete(String(idFactura));
    return;
  }

  invoiceDetailCache.clear();
};

export const getInvoices = async ({ force = false } = {}) => {
  if (!force && invoicesCache) {
    return invoicesCache;
  }

  return dedupeRequest("invoices:list", async () => {
    const response = await axiosInstance.get("/invoices");
    invoicesCache = unwrapResponse(response);
    return invoicesCache;
  });
};

export const getInvoiceById = async (idFactura, { force = false } = {}) => {
  const cacheKey = String(idFactura);

  if (!force && invoiceDetailCache.has(cacheKey)) {
    return invoiceDetailCache.get(cacheKey);
  }

  return dedupeRequest(`invoices:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/invoices/${encodeInvoiceId(idFactura)}`);
    const data = unwrapResponse(response);
    invoiceDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createInvoice = async (payload) => {
  const response = await axiosInstance.post("/invoices", payload);
  const data = unwrapResponse(response);
  clearInvoiceCaches(data?.idFactura);
  return data;
};

export const updateInvoice = async (idFactura, payload) => {
  const response = await axiosInstance.put(`/invoices/${encodeInvoiceId(idFactura)}`, payload);
  const data = unwrapResponse(response);
  clearInvoiceCaches(idFactura);
  invoiceDetailCache.set(String(idFactura), data);
  return data;
};

export const deleteInvoice = async (idFactura) => {
  const response = await axiosInstance.delete(`/invoices/${encodeInvoiceId(idFactura)}`);
  clearInvoiceCaches(idFactura);
  return unwrapResponse(response);
};
