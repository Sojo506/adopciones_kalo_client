import axiosInstance from "./axiosConfig";
import { clearProvincesCache } from "./locations";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let provincesCache = null;
const provinceDetailCache = new Map();

const clearProvinceCaches = (idProvincia) => {
  provincesCache = null;

  if (idProvincia !== undefined && idProvincia !== null) {
    provinceDetailCache.delete(String(idProvincia));
    return;
  }

  provinceDetailCache.clear();
};

const invalidateRelatedCaches = (idProvincia) => {
  clearProvinceCaches(idProvincia);
  clearProvincesCache();
  invalidateUsersCache();
};

export const getProvinces = async ({ force = false } = {}) => {
  if (!force && provincesCache) {
    return provincesCache;
  }

  return dedupeRequest("provinces:list", async () => {
    const response = await axiosInstance.get("/provinces");
    provincesCache = unwrapResponse(response);
    return provincesCache;
  });
};

export const getProvinceById = async (idProvincia, { force = false } = {}) => {
  const cacheKey = String(idProvincia);

  if (!force && provinceDetailCache.has(cacheKey)) {
    return provinceDetailCache.get(cacheKey);
  }

  return dedupeRequest(`provinces:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/provinces/${idProvincia}`);
    const data = unwrapResponse(response);
    provinceDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createProvince = async (payload) => {
  const response = await axiosInstance.post("/provinces", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idProvincia);
  return data;
};

export const updateProvince = async (idProvincia, payload) => {
  const response = await axiosInstance.put(`/provinces/${idProvincia}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idProvincia);
  provinceDetailCache.set(String(idProvincia), data);
  return data;
};

export const deleteProvince = async (idProvincia) => {
  const response = await axiosInstance.delete(`/provinces/${idProvincia}`);
  invalidateRelatedCaches(idProvincia);
  return unwrapResponse(response);
};
