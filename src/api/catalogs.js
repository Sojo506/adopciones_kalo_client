import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let userTypesCache = null;
let statesCache = null;

export const getUserTypes = async ({ force = false } = {}) => {
  if (!force && userTypesCache) {
    return userTypesCache;
  }

  const response = await axiosInstance.get("/catalogs/user-types");
  userTypesCache = unwrapResponse(response);
  return userTypesCache;
};

export const getStates = async ({ force = false } = {}) => {
  if (!force && statesCache) {
    return statesCache;
  }

  const response = await axiosInstance.get("/catalogs/states");
  statesCache = unwrapResponse(response);
  return statesCache;
};
