import axiosInstance from "./axiosConfig";
import { clearBrandsCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let brandsCache = null;
const brandDetailCache = new Map();

const clearBrandCaches = (idMarca) => {
  brandsCache = null;

  if (idMarca !== undefined && idMarca !== null) {
    brandDetailCache.delete(String(idMarca));
    return;
  }

  brandDetailCache.clear();
};

const invalidateRelatedCaches = (idMarca) => {
  clearBrandCaches(idMarca);
  clearBrandsCache();
};

export const getBrands = async ({ force = false } = {}) => {
  if (!force && brandsCache) {
    return brandsCache;
  }

  return dedupeRequest("brands:list", async () => {
    const response = await axiosInstance.get("/brands");
    brandsCache = unwrapResponse(response);
    return brandsCache;
  });
};

export const getBrandById = async (idMarca, { force = false } = {}) => {
  const cacheKey = String(idMarca);

  if (!force && brandDetailCache.has(cacheKey)) {
    return brandDetailCache.get(cacheKey);
  }

  return dedupeRequest(`brands:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/brands/${idMarca}`);
    const data = unwrapResponse(response);
    brandDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createBrand = async (payload) => {
  const response = await axiosInstance.post("/brands", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idMarca);
  return data;
};

export const updateBrand = async (idMarca, payload) => {
  const response = await axiosInstance.put(`/brands/${idMarca}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idMarca);
  brandDetailCache.set(String(idMarca), data);
  return data;
};

export const deleteBrand = async (idMarca) => {
  const response = await axiosInstance.delete(`/brands/${idMarca}`);
  invalidateRelatedCaches(idMarca);
  return unwrapResponse(response);
};
