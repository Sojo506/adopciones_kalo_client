import axiosInstance from "./axiosConfig";
import { clearSexesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let sexesCache = null;
const sexDetailCache = new Map();

const clearSexCaches = (idSexo) => {
  sexesCache = null;

  if (idSexo !== undefined && idSexo !== null) {
    sexDetailCache.delete(String(idSexo));
    return;
  }

  sexDetailCache.clear();
};

const invalidateRelatedCaches = (idSexo) => {
  clearSexCaches(idSexo);
  clearSexesCache();
};

export const getSexes = async ({ force = false } = {}) => {
  if (!force && sexesCache) {
    return sexesCache;
  }

  return dedupeRequest("sexes:list", async () => {
    const response = await axiosInstance.get("/sexes");
    sexesCache = unwrapResponse(response);
    return sexesCache;
  });
};

export const getSexById = async (idSexo, { force = false } = {}) => {
  const cacheKey = String(idSexo);

  if (!force && sexDetailCache.has(cacheKey)) {
    return sexDetailCache.get(cacheKey);
  }

  return dedupeRequest(`sexes:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/sexes/${idSexo}`);
    const data = unwrapResponse(response);
    sexDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createSex = async (payload) => {
  const response = await axiosInstance.post("/sexes", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idSexo);
  return data;
};

export const updateSex = async (idSexo, payload) => {
  const response = await axiosInstance.put(`/sexes/${idSexo}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idSexo);
  sexDetailCache.set(String(idSexo), data);
  return data;
};

export const deleteSex = async (idSexo) => {
  const response = await axiosInstance.delete(`/sexes/${idSexo}`);
  invalidateRelatedCaches(idSexo);
  return unwrapResponse(response);
};
