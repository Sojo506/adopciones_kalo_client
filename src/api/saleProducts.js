import axiosInstance from "./axiosConfig";
import { clearSaleCaches } from "./sales";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let saleProductsCache = null;
const saleProductDetailCache = new Map();

const normalizeSaleProductKey = (idVenta, idProducto) => `${idVenta}:${idProducto}`;

export const clearSaleProductCaches = (idVenta, idProducto) => {
  saleProductsCache = null;

  if (idVenta !== undefined && idVenta !== null && idProducto !== undefined && idProducto !== null) {
    saleProductDetailCache.delete(normalizeSaleProductKey(idVenta, idProducto));
    return;
  }

  saleProductDetailCache.clear();
};

const invalidateRelatedCaches = (idVenta, idProducto) => {
  clearSaleProductCaches(idVenta, idProducto);
  clearSaleCaches(idVenta);
};

export const getSaleProducts = async ({ force = false } = {}) => {
  if (!force && saleProductsCache) {
    return saleProductsCache;
  }

  return dedupeRequest("sale-products:list", async () => {
    const response = await axiosInstance.get("/sale-products");
    saleProductsCache = unwrapResponse(response);
    return saleProductsCache;
  });
};

export const getSaleProductByPk = async (idVenta, idProducto, { force = false } = {}) => {
  const cacheKey = normalizeSaleProductKey(idVenta, idProducto);

  if (!force && saleProductDetailCache.has(cacheKey)) {
    return saleProductDetailCache.get(cacheKey);
  }

  return dedupeRequest(`sale-products:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/sale-products/${idVenta}/${idProducto}`);
    const data = unwrapResponse(response);
    saleProductDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createSaleProduct = async (payload) => {
  const response = await axiosInstance.post("/sale-products", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idVenta, data?.idProducto);
  return data;
};

export const updateSaleProduct = async (idVenta, idProducto, payload) => {
  const response = await axiosInstance.put(`/sale-products/${idVenta}/${idProducto}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idVenta, idProducto);
  saleProductDetailCache.set(normalizeSaleProductKey(idVenta, idProducto), data);
  return data;
};

export const deleteSaleProduct = async (idVenta, idProducto) => {
  const response = await axiosInstance.delete(`/sale-products/${idVenta}/${idProducto}`);
  invalidateRelatedCaches(idVenta, idProducto);
  return unwrapResponse(response);
};
