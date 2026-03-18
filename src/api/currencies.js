import axiosInstance from "./axiosConfig";
import { clearCurrenciesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let currenciesCache = null;
const currencyDetailCache = new Map();

const clearCurrencyCaches = (idMoneda) => {
  currenciesCache = null;

  if (idMoneda !== undefined && idMoneda !== null) {
    currencyDetailCache.delete(String(idMoneda));
    return;
  }

  currencyDetailCache.clear();
};

const invalidateRelatedCaches = (idMoneda) => {
  clearCurrencyCaches(idMoneda);
  clearCurrenciesCache();
};

export const getCurrencies = async ({ force = false } = {}) => {
  if (!force && currenciesCache) {
    return currenciesCache;
  }

  return dedupeRequest("currencies:list", async () => {
    const response = await axiosInstance.get("/currencies");
    currenciesCache = unwrapResponse(response);
    return currenciesCache;
  });
};

export const getCurrencyById = async (idMoneda, { force = false } = {}) => {
  const cacheKey = String(idMoneda);

  if (!force && currencyDetailCache.has(cacheKey)) {
    return currencyDetailCache.get(cacheKey);
  }

  return dedupeRequest(`currencies:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/currencies/${idMoneda}`);
    const data = unwrapResponse(response);
    currencyDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createCurrency = async (payload) => {
  const response = await axiosInstance.post("/currencies", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idMoneda);
  return data;
};

export const updateCurrency = async (idMoneda, payload) => {
  const response = await axiosInstance.put(`/currencies/${idMoneda}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idMoneda);
  currencyDetailCache.set(String(idMoneda), data);
  return data;
};

export const deleteCurrency = async (idMoneda) => {
  const response = await axiosInstance.delete(`/currencies/${idMoneda}`);
  invalidateRelatedCaches(idMoneda);
  return unwrapResponse(response);
};
