import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let countriesCache = null;
const provincesCache = new Map();
const cantonsCache = new Map();
const districtsCache = new Map();

export const clearCountriesCache = () => {
  countriesCache = null;
};

export const clearProvincesCache = (idPais) => {
  if (idPais !== undefined && idPais !== null) {
    provincesCache.delete(idPais);
    return;
  }

  provincesCache.clear();
};

export const clearCantonsCache = (idProvincia) => {
  if (idProvincia !== undefined && idProvincia !== null) {
    cantonsCache.delete(idProvincia);
    return;
  }

  cantonsCache.clear();
};

export const clearDistrictsCache = (idCanton) => {
  if (idCanton !== undefined && idCanton !== null) {
    districtsCache.delete(idCanton);
    return;
  }

  districtsCache.clear();
};

export const getCountries = async ({ force = false } = {}) => {
  if (!force && countriesCache) {
    return countriesCache;
  }

  return dedupeRequest("locations:countries", async () => {
    const response = await axiosInstance.get("/locations/countries");
    countriesCache = unwrapResponse(response);
    return countriesCache;
  });
};

export const getProvinces = async (idPais, { force = false } = {}) => {
  if (!force && provincesCache.has(idPais)) {
    return provincesCache.get(idPais);
  }

  return dedupeRequest(`locations:provinces:${idPais}`, async () => {
    const response = await axiosInstance.get("/locations/provinces", { params: { idPais } });
    const data = unwrapResponse(response);
    provincesCache.set(idPais, data);
    return data;
  });
};

export const getCantons = async (idProvincia, { force = false } = {}) => {
  if (!force && cantonsCache.has(idProvincia)) {
    return cantonsCache.get(idProvincia);
  }

  return dedupeRequest(`locations:cantons:${idProvincia}`, async () => {
    const response = await axiosInstance.get("/locations/cantons", { params: { idProvincia } });
    const data = unwrapResponse(response);
    cantonsCache.set(idProvincia, data);
    return data;
  });
};

export const getDistricts = async (idCanton, { force = false } = {}) => {
  if (!force && districtsCache.has(idCanton)) {
    return districtsCache.get(idCanton);
  }

  return dedupeRequest(`locations:districts:${idCanton}`, async () => {
    const response = await axiosInstance.get("/locations/districts", { params: { idCanton } });
    const data = unwrapResponse(response);
    districtsCache.set(idCanton, data);
    return data;
  });
};
