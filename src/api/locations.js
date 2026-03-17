import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let countriesCache = null;
const provincesCache = new Map();
const cantonsCache = new Map();
const districtsCache = new Map();

export const getCountries = async ({ force = false } = {}) => {
  if (!force && countriesCache) {
    return countriesCache;
  }

  const response = await axiosInstance.get("/locations/countries");
  countriesCache = unwrapResponse(response);
  return countriesCache;
};

export const getProvinces = async (idPais, { force = false } = {}) => {
  if (!force && provincesCache.has(idPais)) {
    return provincesCache.get(idPais);
  }

  const response = await axiosInstance.get("/locations/provinces", { params: { idPais } });
  const data = unwrapResponse(response);
  provincesCache.set(idPais, data);
  return data;
};

export const getCantons = async (idProvincia, { force = false } = {}) => {
  if (!force && cantonsCache.has(idProvincia)) {
    return cantonsCache.get(idProvincia);
  }

  const response = await axiosInstance.get("/locations/cantons", { params: { idProvincia } });
  const data = unwrapResponse(response);
  cantonsCache.set(idProvincia, data);
  return data;
};

export const getDistricts = async (idCanton, { force = false } = {}) => {
  if (!force && districtsCache.has(idCanton)) {
    return districtsCache.get(idCanton);
  }

  const response = await axiosInstance.get("/locations/districts", { params: { idCanton } });
  const data = unwrapResponse(response);
  districtsCache.set(idCanton, data);
  return data;
};
