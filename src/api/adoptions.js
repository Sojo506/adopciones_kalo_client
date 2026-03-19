import axiosInstance from "./axiosConfig";
import { invalidateRequestCaches } from "./requests";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let adoptionsCache = null;
const adoptionDetailCache = new Map();

const clearAdoptionCaches = (idAdopcion) => {
  adoptionsCache = null;

  if (idAdopcion !== undefined && idAdopcion !== null) {
    adoptionDetailCache.delete(String(idAdopcion));
    return;
  }

  adoptionDetailCache.clear();
};

export const getAdoptions = async ({ force = false } = {}) => {
  if (!force && adoptionsCache) {
    return adoptionsCache;
  }

  return dedupeRequest("adoptions:list", async () => {
    const response = await axiosInstance.get("/adoptions");
    adoptionsCache = unwrapResponse(response);
    return adoptionsCache;
  });
};

export const getAdoptionById = async (idAdopcion, { force = false } = {}) => {
  const cacheKey = String(idAdopcion);

  if (!force && adoptionDetailCache.has(cacheKey)) {
    return adoptionDetailCache.get(cacheKey);
  }

  return dedupeRequest(`adoptions:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/adoptions/${idAdopcion}`);
    const data = unwrapResponse(response);
    adoptionDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createAdoption = async (payload) => {
  const response = await axiosInstance.post("/adoptions", payload);
  const data = unwrapResponse(response);
  clearAdoptionCaches(data?.idAdopcion);
  invalidateRequestCaches();
  return data;
};

export const updateAdoption = async (idAdopcion, payload) => {
  const response = await axiosInstance.put(`/adoptions/${idAdopcion}`, payload);
  const data = unwrapResponse(response);
  clearAdoptionCaches(idAdopcion);
  adoptionDetailCache.set(String(idAdopcion), data);
  invalidateRequestCaches();
  return data;
};

export const deleteAdoption = async (idAdopcion) => {
  const response = await axiosInstance.delete(`/adoptions/${idAdopcion}`);
  clearAdoptionCaches(idAdopcion);
  invalidateRequestCaches();
  return unwrapResponse(response);
};
