import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? null;
let profileOverviewCache = null;
let profileFollowUpsCache = null;

export const clearProfileOverviewCache = () => {
  profileOverviewCache = null;
};

export const clearProfileFollowUpsCache = () => {
  profileFollowUpsCache = null;
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

export const getCurrentProfileFollowUps = async ({ force = false } = {}) => {
  if (!force && profileFollowUpsCache) {
    return profileFollowUpsCache;
  }

  return dedupeRequest("profile:follow-ups", async () => {
    const response = await axiosInstance.get("/auth/profile/follow-ups");
    profileFollowUpsCache = unwrapResponse(response) ?? [];
    return profileFollowUpsCache;
  });
};

export const updateCurrentProfile = async (payload) => {
  const response = await axiosInstance.put("/auth/profile", payload);
  const data = unwrapResponse(response);
  profileOverviewCache = data;
  return data;
};

export const requestCurrentEmailChange = async (payload) => {
  const response = await axiosInstance.post("/auth/profile/email/request-change", payload);
  return unwrapResponse(response);
};

export const confirmCurrentEmailChange = async (payload) => {
  const response = await axiosInstance.post("/auth/profile/email/confirm-change", payload);
  const data = unwrapResponse(response);
  profileOverviewCache = data;
  return data;
};

export const requestCurrentPasswordChange = async (payload) => {
  const response = await axiosInstance.post("/auth/profile/password/request-change", payload);
  return unwrapResponse(response);
};

export const confirmCurrentPasswordChange = async (payload) => {
  const response = await axiosInstance.post("/auth/profile/password/confirm-change", payload);
  clearProfileOverviewCache();
  clearProfileFollowUpsCache();
  return unwrapResponse(response);
};
