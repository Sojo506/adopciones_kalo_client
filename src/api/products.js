import axiosInstance from "./axiosConfig";
import { clearProductsCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let productsCache = null;
const productDetailCache = new Map();

export const clearProductCaches = (idProducto) => {
  productsCache = null;

  if (idProducto !== undefined && idProducto !== null) {
    productDetailCache.delete(String(idProducto));
    return;
  }

  productDetailCache.clear();
};

export const invalidateProductCaches = (idProducto) => {
  clearProductCaches(idProducto);
  clearProductsCache();
};

export const getProducts = async ({ force = false } = {}) => {
  if (!force && productsCache) {
    return productsCache;
  }

  return dedupeRequest("products:list", async () => {
    const response = await axiosInstance.get("/products");
    productsCache = unwrapResponse(response);
    return productsCache;
  });
};

export const getProductById = async (idProducto, { force = false } = {}) => {
  const cacheKey = String(idProducto);

  if (!force && productDetailCache.has(cacheKey)) {
    return productDetailCache.get(cacheKey);
  }

  return dedupeRequest(`products:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/products/${idProducto}`);
    const data = unwrapResponse(response);
    productDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createProduct = async (payload) => {
  const response = await axiosInstance.post("/products", payload);
  const data = unwrapResponse(response);
  invalidateProductCaches(data?.idProducto);
  return data;
};

export const updateProduct = async (idProducto, payload) => {
  const response = await axiosInstance.put(`/products/${idProducto}`, payload);
  const data = unwrapResponse(response);
  invalidateProductCaches(idProducto);
  productDetailCache.set(String(idProducto), data);
  return data;
};

export const deleteProduct = async (idProducto) => {
  const response = await axiosInstance.delete(`/products/${idProducto}`);
  invalidateProductCaches(idProducto);
  return unwrapResponse(response);
};
