import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let addressesCache = null;
const addressDetailCache = new Map();

const clearAddressCaches = (idDireccion) => {
  addressesCache = null;

  if (idDireccion !== undefined && idDireccion !== null) {
    addressDetailCache.delete(String(idDireccion));
    return;
  }

  addressDetailCache.clear();
};

const invalidateRelatedCaches = (idDireccion) => {
  clearAddressCaches(idDireccion);
  invalidateUsersCache();
};

export const getAddresses = async ({ force = false } = {}) => {
  if (!force && addressesCache) {
    return addressesCache;
  }

  return dedupeRequest("addresses:list", async () => {
    const response = await axiosInstance.get("/addresses");
    addressesCache = unwrapResponse(response);
    return addressesCache;
  });
};

export const getAddressById = async (idDireccion, { force = false } = {}) => {
  const cacheKey = String(idDireccion);

  if (!force && addressDetailCache.has(cacheKey)) {
    return addressDetailCache.get(cacheKey);
  }

  return dedupeRequest(`addresses:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/addresses/${idDireccion}`);
    const data = unwrapResponse(response);
    addressDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createAddress = async (payload) => {
  const response = await axiosInstance.post("/addresses", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idDireccion);
  return data;
};

export const updateAddress = async (idDireccion, payload) => {
  const response = await axiosInstance.put(`/addresses/${idDireccion}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idDireccion);
  addressDetailCache.set(String(idDireccion), data);
  return data;
};

export const deleteAddress = async (idDireccion) => {
  const response = await axiosInstance.delete(`/addresses/${idDireccion}`);
  invalidateRelatedCaches(idDireccion);
  return unwrapResponse(response);
};
