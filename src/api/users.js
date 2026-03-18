import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let usersCache = null;
const userDetailCache = new Map();

const clearUserCaches = (identificacion) => {
  usersCache = null;

  if (identificacion !== undefined && identificacion !== null) {
    userDetailCache.delete(String(identificacion));
    return;
  }

  userDetailCache.clear();
};

export const invalidateUsersCache = (identificacion) => {
  clearUserCaches(identificacion);
};

export const getUsers = async ({ force = false } = {}) => {
  if (!force && usersCache) {
    return usersCache;
  }

  return dedupeRequest("users:list", async () => {
    const response = await axiosInstance.get("/auth");
    usersCache = unwrapResponse(response);
    return usersCache;
  });
};

export const getUserByIdentification = async (identificacion, { force = false } = {}) => {
  const cacheKey = String(identificacion);

  if (!force && userDetailCache.has(cacheKey)) {
    return userDetailCache.get(cacheKey);
  }

  return dedupeRequest(`users:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/auth/${identificacion}`);
    const data = unwrapResponse(response);
    userDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createUser = async (payload) => {
  const response = await axiosInstance.post("/auth", payload);
  clearUserCaches(payload?.identificacion);
  return unwrapResponse(response);
};

export const updateUser = async (identificacion, payload) => {
  const response = await axiosInstance.put(`/auth/${identificacion}`, payload);
  const data = unwrapResponse(response);
  clearUserCaches(identificacion);
  userDetailCache.set(String(identificacion), data);
  return data;
};

export const deleteUser = async (identificacion) => {
  const response = await axiosInstance.delete(`/auth/${identificacion}`);
  clearUserCaches(identificacion);
  return unwrapResponse(response);
};
