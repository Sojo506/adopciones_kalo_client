import axiosInstance from "./axiosConfig";
import { clearInvoiceCaches } from "./invoices";
import { dedupeRequest } from "./requestCache";
import { clearSaleCaches } from "./sales";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let saleInvoicesCache = null;
const saleInvoiceDetailCache = new Map();

const encodeInvoiceId = (idFactura) => encodeURIComponent(String(idFactura));
const normalizeSaleInvoiceKey = (idVenta, idFactura) => `${idVenta}:${String(idFactura)}`;

export const clearSaleInvoiceCaches = (idVenta, idFactura) => {
  saleInvoicesCache = null;

  if (idVenta !== undefined && idVenta !== null && idFactura !== undefined && idFactura !== null) {
    saleInvoiceDetailCache.delete(normalizeSaleInvoiceKey(idVenta, idFactura));
    return;
  }

  saleInvoiceDetailCache.clear();
};

const invalidateRelatedCaches = (idVenta, idFactura) => {
  clearSaleInvoiceCaches(idVenta, idFactura);
  clearSaleCaches(idVenta);
  clearInvoiceCaches(idFactura);
};

export const getSaleInvoices = async ({ force = false } = {}) => {
  if (!force && saleInvoicesCache) {
    return saleInvoicesCache;
  }

  return dedupeRequest("sale-invoices:list", async () => {
    const response = await axiosInstance.get("/sale-invoices");
    saleInvoicesCache = unwrapResponse(response);
    return saleInvoicesCache;
  });
};

export const getSaleInvoiceByPk = async (idVenta, idFactura, { force = false } = {}) => {
  const cacheKey = normalizeSaleInvoiceKey(idVenta, idFactura);

  if (!force && saleInvoiceDetailCache.has(cacheKey)) {
    return saleInvoiceDetailCache.get(cacheKey);
  }

  return dedupeRequest(`sale-invoices:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(
      `/sale-invoices/${idVenta}/${encodeInvoiceId(idFactura)}`,
    );
    const data = unwrapResponse(response);
    saleInvoiceDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createSaleInvoice = async (payload) => {
  const response = await axiosInstance.post("/sale-invoices", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idVenta, data?.idFactura);
  return data;
};

export const updateSaleInvoice = async (idVenta, idFactura, payload) => {
  const response = await axiosInstance.put(
    `/sale-invoices/${idVenta}/${encodeInvoiceId(idFactura)}`,
    payload,
  );
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idVenta, idFactura);
  saleInvoiceDetailCache.set(normalizeSaleInvoiceKey(idVenta, idFactura), data);
  return data;
};

export const deleteSaleInvoice = async (idVenta, idFactura) => {
  const response = await axiosInstance.delete(
    `/sale-invoices/${idVenta}/${encodeInvoiceId(idFactura)}`,
  );
  invalidateRelatedCaches(idVenta, idFactura);
  return unwrapResponse(response);
};
