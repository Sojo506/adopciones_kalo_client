import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let accountsCache = null;
const accountDetailCache = new Map();

const clearAccountCaches = (idCuenta) => {
  accountsCache = null;

  if (idCuenta !== undefined && idCuenta !== null) {
    accountDetailCache.delete(String(idCuenta));
    return;
  }

  accountDetailCache.clear();
};

const invalidateRelatedCaches = (idCuenta) => {
  clearAccountCaches(idCuenta);
  invalidateUsersCache();
};

export const getAccounts = async ({ force = false } = {}) => {
  if (!force && accountsCache) {
    return accountsCache;
  }

  return dedupeRequest("accounts:list", async () => {
    const response = await axiosInstance.get("/accounts");
    accountsCache = unwrapResponse(response);
    return accountsCache;
  });
};

export const getAccountById = async (idCuenta, { force = false } = {}) => {
  const cacheKey = String(idCuenta);

  if (!force && accountDetailCache.has(cacheKey)) {
    return accountDetailCache.get(cacheKey);
  }

  return dedupeRequest(`accounts:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/accounts/${idCuenta}`);
    const data = unwrapResponse(response);
    accountDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createAccount = async (payload) => {
  const response = await axiosInstance.post("/accounts", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idCuenta);
  return data;
};

export const updateAccount = async (idCuenta, payload) => {
  const response = await axiosInstance.put(`/accounts/${idCuenta}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idCuenta);
  accountDetailCache.set(String(idCuenta), data);
  return data;
};

export const deleteAccount = async (idCuenta) => {
  const response = await axiosInstance.delete(`/accounts/${idCuenta}`);
  invalidateRelatedCaches(idCuenta);
  return unwrapResponse(response);
};
