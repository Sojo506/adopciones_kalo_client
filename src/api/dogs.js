import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];

let dogsCache = null;
const dogDetailCache = new Map();

export const clearDogsCache = (idPerrito) => {
  dogsCache = null;

  if (idPerrito !== undefined && idPerrito !== null) {
    dogDetailCache.delete(String(idPerrito));
    return;
  }

  dogDetailCache.clear();
};

export const getAvailableDogs = async ({ force = false } = {}) => {
  if (!force && dogsCache) {
    return dogsCache;
  }

  return dedupeRequest("dogs:list", async () => {
    const response = await axiosInstance.get("/dogs");
    dogsCache = unwrapResponse(response);
    return dogsCache;
  });
};

export const getDogById = async (idPerrito, { force = false } = {}) => {
  const cacheKey = String(idPerrito);

  if (!force && dogDetailCache.has(cacheKey)) {
    return dogDetailCache.get(cacheKey);
  }

  return dedupeRequest(`dogs:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/dogs/${idPerrito}`);
    const data = unwrapResponse(response);
    dogDetailCache.set(cacheKey, data);
    return data;
  });
};
