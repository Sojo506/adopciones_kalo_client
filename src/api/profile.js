import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? null;
let profileOverviewCache = null;

export const clearProfileOverviewCache = () => {
  profileOverviewCache = null;
};

export const getCurrentProfileOverview = async ({ force = false } = {}) => {
  if (!force && profileOverviewCache) {
    return profileOverviewCache;
  }

  return dedupeRequest("profile:overview", async () => {
    const response = await axiosInstance.get("/auth/profile");
    profileOverviewCache = unwrapResponse(response);
    return profileOverviewCache;
  });
};

export const updateCurrentProfile = async (payload) => {
  const response = await axiosInstance.put("/auth/profile", payload);
  const data = unwrapResponse(response);
  profileOverviewCache = data;
  return data;
};
