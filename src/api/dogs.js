import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];

let availableDogsCache = null;
let adminDogsCache = null;
const publicDogDetailCache = new Map();
const adminDogDetailCache = new Map();

export const clearDogsCache = (idPerrito) => {
  availableDogsCache = null;
  adminDogsCache = null;

  if (idPerrito !== undefined && idPerrito !== null) {
    const cacheKey = String(idPerrito);
    publicDogDetailCache.delete(cacheKey);
    adminDogDetailCache.delete(cacheKey);
    return;
  }

  publicDogDetailCache.clear();
  adminDogDetailCache.clear();
};

export const invalidateDogCaches = (idPerrito) => {
  clearDogsCache(idPerrito);
};

export const getAvailableDogs = async ({ force = false } = {}) => {
  if (!force && availableDogsCache) {
    return availableDogsCache;
  }

  return dedupeRequest("dogs:public:list", async () => {
    const response = await axiosInstance.get("/dogs");
    availableDogsCache = unwrapResponse(response);
    return availableDogsCache;
  });
};

export const getDogById = async (idPerrito, { force = false } = {}) => {
  const cacheKey = String(idPerrito);

  if (!force && publicDogDetailCache.has(cacheKey)) {
    return publicDogDetailCache.get(cacheKey);
  }

  return dedupeRequest(`dogs:public:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/dogs/${idPerrito}`);
    const data = unwrapResponse(response);
    publicDogDetailCache.set(cacheKey, data);
    return data;
  });
};

export const getDogs = async ({ force = false } = {}) => {
  if (!force && adminDogsCache) {
    return adminDogsCache;
  }

  return dedupeRequest("dogs:admin:list", async () => {
    const response = await axiosInstance.get("/dogs/admin");
    adminDogsCache = unwrapResponse(response);
    return adminDogsCache;
  });
};

export const getDogByIdAdmin = async (idPerrito, { force = false } = {}) => {
  const cacheKey = String(idPerrito);

  if (!force && adminDogDetailCache.has(cacheKey)) {
    return adminDogDetailCache.get(cacheKey);
  }

  return dedupeRequest(`dogs:admin:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/dogs/admin/${idPerrito}`);
    const data = unwrapResponse(response);
    adminDogDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createDog = async (payload) => {
  const response = await axiosInstance.post("/dogs", payload);
  const data = unwrapResponse(response);
  clearDogsCache(data?.idPerrito);
  if (data?.idPerrito !== undefined && data?.idPerrito !== null) {
    adminDogDetailCache.set(String(data.idPerrito), data);
  }
  return data;
};

export const updateDog = async (idPerrito, payload) => {
  const response = await axiosInstance.put(`/dogs/${idPerrito}`, payload);
  const data = unwrapResponse(response);
  clearDogsCache(idPerrito);
  if (data) {
    adminDogDetailCache.set(String(idPerrito), data);
  }
  return data;
};

export const deleteDog = async (idPerrito) => {
  const response = await axiosInstance.delete(`/dogs/${idPerrito}`);
  clearDogsCache(idPerrito);
  return unwrapResponse(response);
};
