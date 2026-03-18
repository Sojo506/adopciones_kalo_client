import axiosInstance from "./axiosConfig";
import { clearBreedsCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let breedsCache = null;
const breedDetailCache = new Map();

const clearBreedCaches = (idRaza) => {
  breedsCache = null;

  if (idRaza !== undefined && idRaza !== null) {
    breedDetailCache.delete(String(idRaza));
    return;
  }

  breedDetailCache.clear();
};

const invalidateRelatedCaches = (idRaza) => {
  clearBreedCaches(idRaza);
  clearBreedsCache();
};

export const getBreeds = async ({ force = false } = {}) => {
  if (!force && breedsCache) {
    return breedsCache;
  }

  return dedupeRequest("breeds:list", async () => {
    const response = await axiosInstance.get("/breeds");
    breedsCache = unwrapResponse(response);
    return breedsCache;
  });
};

export const getBreedById = async (idRaza, { force = false } = {}) => {
  const cacheKey = String(idRaza);

  if (!force && breedDetailCache.has(cacheKey)) {
    return breedDetailCache.get(cacheKey);
  }

  return dedupeRequest(`breeds:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/breeds/${idRaza}`);
    const data = unwrapResponse(response);
    breedDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createBreed = async (payload) => {
  const response = await axiosInstance.post("/breeds", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idRaza);
  return data;
};

export const updateBreed = async (idRaza, payload) => {
  const response = await axiosInstance.put(`/breeds/${idRaza}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idRaza);
  breedDetailCache.set(String(idRaza), data);
  return data;
};

export const deleteBreed = async (idRaza) => {
  const response = await axiosInstance.delete(`/breeds/${idRaza}`);
  invalidateRelatedCaches(idRaza);
  return unwrapResponse(response);
};
