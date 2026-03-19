import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let salesCache = null;
const saleDetailCache = new Map();

export const clearSaleCaches = (idVenta) => {
  salesCache = null;

  if (idVenta !== undefined && idVenta !== null) {
    saleDetailCache.delete(String(idVenta));
    return;
  }

  saleDetailCache.clear();
};

export const getSales = async ({ force = false } = {}) => {
  if (!force && salesCache) {
    return salesCache;
  }

  return dedupeRequest("sales:list", async () => {
    const response = await axiosInstance.get("/sales");
    salesCache = unwrapResponse(response);
    return salesCache;
  });
};

export const getSaleById = async (idVenta, { force = false } = {}) => {
  const cacheKey = String(idVenta);

  if (!force && saleDetailCache.has(cacheKey)) {
    return saleDetailCache.get(cacheKey);
  }

  return dedupeRequest(`sales:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/sales/${idVenta}`);
    const data = unwrapResponse(response);
    saleDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createSale = async (payload) => {
  const response = await axiosInstance.post("/sales", payload);
  const data = unwrapResponse(response);
  clearSaleCaches(data?.idVenta);
  return data;
};

export const updateSale = async (idVenta, payload) => {
  const response = await axiosInstance.put(`/sales/${idVenta}`, payload);
  const data = unwrapResponse(response);
  clearSaleCaches(idVenta);
  saleDetailCache.set(String(idVenta), data);
  return data;
};

export const deleteSale = async (idVenta) => {
  const response = await axiosInstance.delete(`/sales/${idVenta}`);
  clearSaleCaches(idVenta);
  return unwrapResponse(response);
};
