import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let fosterHomesCache = null;
const fosterHomeDetailCache = new Map();

const clearFosterHomeCaches = (idCasaCuna) => {
  fosterHomesCache = null;

  if (idCasaCuna !== undefined && idCasaCuna !== null) {
    fosterHomeDetailCache.delete(String(idCasaCuna));
    return;
  }

  fosterHomeDetailCache.clear();
};

export const getFosterHomes = async ({ force = false } = {}) => {
  if (!force && fosterHomesCache) {
    return fosterHomesCache;
  }

  return dedupeRequest("foster-homes:list", async () => {
    const response = await axiosInstance.get("/foster-homes");
    fosterHomesCache = unwrapResponse(response);
    return fosterHomesCache;
  });
};

export const getFosterHomeById = async (idCasaCuna, { force = false } = {}) => {
  const cacheKey = String(idCasaCuna);

  if (!force && fosterHomeDetailCache.has(cacheKey)) {
    return fosterHomeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`foster-homes:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/foster-homes/${idCasaCuna}`);
    const data = unwrapResponse(response);
    fosterHomeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createFosterHome = async (payload) => {
  const response = await axiosInstance.post("/foster-homes", payload);
  const data = unwrapResponse(response);
  clearFosterHomeCaches(data?.idCasaCuna);
  return data;
};

export const updateFosterHome = async (idCasaCuna, payload) => {
  const response = await axiosInstance.put(`/foster-homes/${idCasaCuna}`, payload);
  const data = unwrapResponse(response);
  clearFosterHomeCaches(idCasaCuna);
  fosterHomeDetailCache.set(String(idCasaCuna), data);
  return data;
};

export const deleteFosterHome = async (idCasaCuna) => {
  const response = await axiosInstance.delete(`/foster-homes/${idCasaCuna}`);
  clearFosterHomeCaches(idCasaCuna);
  return unwrapResponse(response);
};
