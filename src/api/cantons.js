import axiosInstance from "./axiosConfig";
import { clearCantonsCache } from "./locations";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let cantonsCache = null;
const cantonDetailCache = new Map();

const clearCantonCaches = (idCanton) => {
  cantonsCache = null;

  if (idCanton !== undefined && idCanton !== null) {
    cantonDetailCache.delete(String(idCanton));
    return;
  }

  cantonDetailCache.clear();
};

const invalidateRelatedCaches = (idCanton) => {
  clearCantonCaches(idCanton);
  clearCantonsCache();
  invalidateUsersCache();
};

export const getCantons = async ({ force = false } = {}) => {
  if (!force && cantonsCache) {
    return cantonsCache;
  }

  return dedupeRequest("cantons:list", async () => {
    const response = await axiosInstance.get("/cantons");
    cantonsCache = unwrapResponse(response);
    return cantonsCache;
  });
};

export const getCantonById = async (idCanton, { force = false } = {}) => {
  const cacheKey = String(idCanton);

  if (!force && cantonDetailCache.has(cacheKey)) {
    return cantonDetailCache.get(cacheKey);
  }

  return dedupeRequest(`cantons:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/cantons/${idCanton}`);
    const data = unwrapResponse(response);
    cantonDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createCanton = async (payload) => {
  const response = await axiosInstance.post("/cantons", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idCanton);
  return data;
};

export const updateCanton = async (idCanton, payload) => {
  const response = await axiosInstance.put(`/cantons/${idCanton}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idCanton);
  cantonDetailCache.set(String(idCanton), data);
  return data;
};

export const deleteCanton = async (idCanton) => {
  const response = await axiosInstance.delete(`/cantons/${idCanton}`);
  invalidateRelatedCaches(idCanton);
  return unwrapResponse(response);
};
