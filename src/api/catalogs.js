import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let userTypesCache = null;
let statesCache = null;
let otpTypesCache = null;
let categoriesCache = null;
let brandsCache = null;

export const clearUserTypesCache = () => {
  userTypesCache = null;
};

export const clearStatesCache = () => {
  statesCache = null;
};

export const clearOtpTypesCache = () => {
  otpTypesCache = null;
};

export const clearCategoriesCache = () => {
  categoriesCache = null;
};

export const clearBrandsCache = () => {
  brandsCache = null;
};

export const getUserTypes = async ({ force = false } = {}) => {
  if (!force && userTypesCache) {
    return userTypesCache;
  }

  return dedupeRequest("catalogs:user-types", async () => {
    const response = await axiosInstance.get("/catalogs/user-types");
    userTypesCache = unwrapResponse(response);
    return userTypesCache;
  });
};

export const getStates = async ({ force = false } = {}) => {
  if (!force && statesCache) {
    return statesCache;
  }

  return dedupeRequest("catalogs:states", async () => {
    const response = await axiosInstance.get("/catalogs/states");
    statesCache = unwrapResponse(response);
    return statesCache;
  });
};

export const getOtpTypes = async ({ force = false } = {}) => {
  if (!force && otpTypesCache) {
    return otpTypesCache;
  }

  return dedupeRequest("catalogs:otp-types", async () => {
    const response = await axiosInstance.get("/catalogs/otp-types");
    otpTypesCache = unwrapResponse(response);
    return otpTypesCache;
  });
};

export const getCategories = async ({ force = false } = {}) => {
  if (!force && categoriesCache) {
    return categoriesCache;
  }

  return dedupeRequest("catalogs:categories", async () => {
    const response = await axiosInstance.get("/catalogs/categories");
    categoriesCache = unwrapResponse(response);
    return categoriesCache;
  });
};

export const getBrands = async ({ force = false } = {}) => {
  if (!force && brandsCache) {
    return brandsCache;
  }

  return dedupeRequest("catalogs:brands", async () => {
    const response = await axiosInstance.get("/catalogs/brands");
    brandsCache = unwrapResponse(response);
    return brandsCache;
  });
};
