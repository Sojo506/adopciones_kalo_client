import axiosInstance from "./axiosConfig";
import { clearCountriesCache } from "./locations";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let countriesCache = null;
const countryDetailCache = new Map();

const clearCountryCaches = (idPais) => {
  countriesCache = null;

  if (idPais !== undefined && idPais !== null) {
    countryDetailCache.delete(String(idPais));
    return;
  }

  countryDetailCache.clear();
};

const invalidateRelatedCaches = (idPais) => {
  clearCountryCaches(idPais);
  clearCountriesCache();
  invalidateUsersCache();
};

export const getCountries = async ({ force = false } = {}) => {
  if (!force && countriesCache) {
    return countriesCache;
  }

  return dedupeRequest("countries:list", async () => {
    const response = await axiosInstance.get("/countries");
    countriesCache = unwrapResponse(response);
    return countriesCache;
  });
};

export const getCountryById = async (idPais, { force = false } = {}) => {
  const cacheKey = String(idPais);

  if (!force && countryDetailCache.has(cacheKey)) {
    return countryDetailCache.get(cacheKey);
  }

  return dedupeRequest(`countries:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/countries/${idPais}`);
    const data = unwrapResponse(response);
    countryDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createCountry = async (payload) => {
  const response = await axiosInstance.post("/countries", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idPais);
  return data;
};

export const updateCountry = async (idPais, payload) => {
  const response = await axiosInstance.put(`/countries/${idPais}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idPais);
  countryDetailCache.set(String(idPais), data);
  return data;
};

export const deleteCountry = async (idPais) => {
  const response = await axiosInstance.delete(`/countries/${idPais}`);
  invalidateRelatedCaches(idPais);
  return unwrapResponse(response);
};
