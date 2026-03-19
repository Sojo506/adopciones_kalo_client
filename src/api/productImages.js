import axiosInstance from "./axiosConfig";
import { invalidateProductCaches } from "./products";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
const productImagesByProductCache = new Map();
const productImageDetailCache = new Map();

export const clearProductImageCaches = (idProducto) => {
  if (idProducto !== undefined && idProducto !== null) {
    productImagesByProductCache.delete(String(idProducto));
  } else {
    productImagesByProductCache.clear();
  }

  productImageDetailCache.clear();
};

export const getProductImagesByProduct = async (idProducto, { force = false } = {}) => {
  const cacheKey = String(idProducto);

  if (!force && productImagesByProductCache.has(cacheKey)) {
    return productImagesByProductCache.get(cacheKey);
  }

  return dedupeRequest(`product-images:list:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/product-images/product/${idProducto}`);
    const data = unwrapResponse(response);
    productImagesByProductCache.set(cacheKey, data);
    return data;
  });
};

export const getProductImageById = async (idImagen, { force = false } = {}) => {
  const cacheKey = String(idImagen);

  if (!force && productImageDetailCache.has(cacheKey)) {
    return productImageDetailCache.get(cacheKey);
  }

  return dedupeRequest(`product-images:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/product-images/${idImagen}`);
    const data = unwrapResponse(response);
    productImageDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createProductImage = async (formData) => {
  const response = await axiosInstance.post("/product-images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const data = unwrapResponse(response);
  clearProductImageCaches(data?.idProducto);
  invalidateProductCaches(data?.idProducto);
  if (data?.idImagen !== undefined && data?.idImagen !== null) {
    productImageDetailCache.set(String(data.idImagen), data);
  }
  return data;
};

export const updateProductImage = async (idImagen, formData) => {
  const response = await axiosInstance.put(`/product-images/${idImagen}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const data = unwrapResponse(response);
  clearProductImageCaches();
  invalidateProductCaches();
  if (data) {
    productImageDetailCache.set(String(idImagen), data);
  }
  return data;
};

export const deleteProductImage = async (idImagen, { idProducto } = {}) => {
  const response = await axiosInstance.delete(`/product-images/${idImagen}`);
  clearProductImageCaches(idProducto);
  invalidateProductCaches(idProducto);
  productImageDetailCache.delete(String(idImagen));
  return unwrapResponse(response);
};
