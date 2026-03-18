import axiosInstance from "./axiosConfig";
import { clearUserTypesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let userTypesCache = null;
const userTypeDetailCache = new Map();

const clearUserTypeCaches = (idTipoUsuario) => {
  userTypesCache = null;

  if (idTipoUsuario !== undefined && idTipoUsuario !== null) {
    userTypeDetailCache.delete(String(idTipoUsuario));
  }
};

const invalidateRelatedCaches = (idTipoUsuario) => {
  clearUserTypeCaches(idTipoUsuario);
  clearUserTypesCache();
  invalidateUsersCache();
};

export const getUserTypes = async ({ force = false } = {}) => {
  if (!force && userTypesCache) {
    return userTypesCache;
  }

  return dedupeRequest("user-types:list", async () => {
    const response = await axiosInstance.get("/user-types");
    userTypesCache = unwrapResponse(response);
    return userTypesCache;
  });
};

export const getUserTypeById = async (idTipoUsuario, { force = false } = {}) => {
  const cacheKey = String(idTipoUsuario);

  if (!force && userTypeDetailCache.has(cacheKey)) {
    return userTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`user-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/user-types/${idTipoUsuario}`);
    const data = unwrapResponse(response);
    userTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createUserType = async (payload) => {
  const response = await axiosInstance.post("/user-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoUsuario);
  return data;
};

export const updateUserType = async (idTipoUsuario, payload) => {
  const response = await axiosInstance.put(`/user-types/${idTipoUsuario}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoUsuario);
  userTypeDetailCache.set(String(idTipoUsuario), data);
  return data;
};

export const deleteUserType = async (idTipoUsuario) => {
  const response = await axiosInstance.delete(`/user-types/${idTipoUsuario}`);
  invalidateRelatedCaches(idTipoUsuario);
  return unwrapResponse(response);
};
