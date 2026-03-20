import axiosInstance from "./axiosConfig";
import { clearDonationCaches } from "./donations";
import { clearInvoiceCaches } from "./invoices";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let donationInvoicesCache = null;
const donationInvoiceDetailCache = new Map();

const encodeInvoiceId = (idFactura) => encodeURIComponent(String(idFactura));
const normalizeDonationInvoiceKey = (idDonacion, idFactura) => `${idDonacion}:${String(idFactura)}`;

export const clearDonationInvoiceCaches = (idDonacion, idFactura) => {
  donationInvoicesCache = null;

  if (idDonacion !== undefined && idDonacion !== null && idFactura !== undefined && idFactura !== null) {
    donationInvoiceDetailCache.delete(normalizeDonationInvoiceKey(idDonacion, idFactura));
    return;
  }

  donationInvoiceDetailCache.clear();
};

const invalidateRelatedCaches = (idDonacion, idFactura) => {
  clearDonationInvoiceCaches(idDonacion, idFactura);
  clearDonationCaches(idDonacion);
  clearInvoiceCaches(idFactura);
};

export const getDonationInvoices = async ({ force = false } = {}) => {
  if (!force && donationInvoicesCache) {
    return donationInvoicesCache;
  }

  return dedupeRequest("donation-invoices:list", async () => {
    const response = await axiosInstance.get("/donation-invoices");
    donationInvoicesCache = unwrapResponse(response);
    return donationInvoicesCache;
  });
};

export const getDonationInvoiceByPk = async (idDonacion, idFactura, { force = false } = {}) => {
  const cacheKey = normalizeDonationInvoiceKey(idDonacion, idFactura);

  if (!force && donationInvoiceDetailCache.has(cacheKey)) {
    return donationInvoiceDetailCache.get(cacheKey);
  }

  return dedupeRequest(`donation-invoices:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(
      `/donation-invoices/${idDonacion}/${encodeInvoiceId(idFactura)}`,
    );
    const data = unwrapResponse(response);
    donationInvoiceDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createDonationInvoice = async (payload) => {
  const response = await axiosInstance.post("/donation-invoices", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idDonacion, data?.idFactura);
  return data;
};

export const updateDonationInvoice = async (idDonacion, idFactura, payload) => {
  const response = await axiosInstance.put(
    `/donation-invoices/${idDonacion}/${encodeInvoiceId(idFactura)}`,
    payload,
  );
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idDonacion, idFactura);
  donationInvoiceDetailCache.set(normalizeDonationInvoiceKey(idDonacion, idFactura), data);
  return data;
};

export const deleteDonationInvoice = async (idDonacion, idFactura) => {
  const response = await axiosInstance.delete(
    `/donation-invoices/${idDonacion}/${encodeInvoiceId(idFactura)}`,
  );
  invalidateRelatedCaches(idDonacion, idFactura);
  return unwrapResponse(response);
};
