import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let phonesCache = null;
const phoneDetailCache = new Map();

const buildPhoneCacheKey = (identificacion, telefono) =>
  `${String(identificacion).trim()}:${String(telefono).trim()}`;

const buildPhonePath = (identificacion, telefono) =>
  `/phones/${identificacion}/${encodeURIComponent(String(telefono).trim())}`;

const clearPhoneCaches = (identificacion, telefono) => {
  phonesCache = null;

  if (identificacion !== undefined && identificacion !== null && telefono) {
    phoneDetailCache.delete(buildPhoneCacheKey(identificacion, telefono));
    return;
  }

  phoneDetailCache.clear();
};

export const getPhones = async ({ force = false } = {}) => {
  if (!force && phonesCache) {
    return phonesCache;
  }

  return dedupeRequest("phones:list", async () => {
    const response = await axiosInstance.get("/phones");
    phonesCache = unwrapResponse(response);
    return phonesCache;
  });
};

export const getPhoneByPk = async (identificacion, telefono, { force = false } = {}) => {
  const cacheKey = buildPhoneCacheKey(identificacion, telefono);

  if (!force && phoneDetailCache.has(cacheKey)) {
    return phoneDetailCache.get(cacheKey);
  }

  return dedupeRequest(`phones:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildPhonePath(identificacion, telefono));
    const data = unwrapResponse(response);
    phoneDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createPhone = async (payload) => {
  const response = await axiosInstance.post("/phones", payload);
  const data = unwrapResponse(response);
  clearPhoneCaches(data?.identificacion, data?.telefono);
  return data;
};

export const updatePhone = async (identificacion, telefono, payload) => {
  const response = await axiosInstance.put(buildPhonePath(identificacion, telefono), payload);
  const data = unwrapResponse(response);
  clearPhoneCaches(identificacion, telefono);
  phoneDetailCache.set(buildPhoneCacheKey(identificacion, telefono), data);
  return data;
};

export const deletePhone = async (identificacion, telefono) => {
  const response = await axiosInstance.delete(buildPhonePath(identificacion, telefono));
  clearPhoneCaches(identificacion, telefono);
  return unwrapResponse(response);
};
