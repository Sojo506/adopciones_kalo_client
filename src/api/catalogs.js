import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let userTypesCache = null;
let statesCache = null;

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
