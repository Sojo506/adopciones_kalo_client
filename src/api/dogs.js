import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let dogsCache = null;
const dogDetailCache = new Map();

const buildDogPath = (idPerrito) => `/dogs/${idPerrito}`;

export const clearDogCaches = (idPerrito) => {
  dogsCache = null;

  if (idPerrito !== undefined && idPerrito !== null) {
    dogDetailCache.delete(String(idPerrito));
    return;
  }

  dogDetailCache.clear();
};

export const getDogs = async ({ force = false } = {}) => {
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
    const response = await axiosInstance.get(buildDogPath(idPerrito));
    const data = unwrapResponse(response);
    dogDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createDog = async (payload) => {
  const response = await axiosInstance.post("/dogs", payload);
  const data = unwrapResponse(response);
  clearDogCaches(data?.idPerrito);
  return data;
};

export const updateDog = async (idPerrito, payload) => {
  const response = await axiosInstance.put(buildDogPath(idPerrito), payload);
  const data = unwrapResponse(response);
  clearDogCaches(idPerrito);
  dogDetailCache.set(String(idPerrito), data);
  return data;
};

export const deleteDog = async (idPerrito) => {
  const response = await axiosInstance.delete(buildDogPath(idPerrito));
  clearDogCaches(idPerrito);
  return unwrapResponse(response);
};
