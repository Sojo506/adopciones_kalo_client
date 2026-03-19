import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let refreshTokensCache = null;
const refreshTokenDetailCache = new Map();

const buildRefreshTokenPath = (idRefreshToken) => `/refresh-tokens/${idRefreshToken}`;

const clearRefreshTokenCaches = (idRefreshToken) => {
  refreshTokensCache = null;

  if (idRefreshToken !== undefined && idRefreshToken !== null) {
    refreshTokenDetailCache.delete(String(idRefreshToken));
    return;
  }

  refreshTokenDetailCache.clear();
};

export const getRefreshTokens = async ({ force = false } = {}) => {
  if (!force && refreshTokensCache) {
    return refreshTokensCache;
  }

  return dedupeRequest("refresh-tokens:list", async () => {
    const response = await axiosInstance.get("/refresh-tokens");
    refreshTokensCache = unwrapResponse(response);
    return refreshTokensCache;
  });
};

export const getRefreshTokenById = async (idRefreshToken, { force = false } = {}) => {
  const cacheKey = String(idRefreshToken);

  if (!force && refreshTokenDetailCache.has(cacheKey)) {
    return refreshTokenDetailCache.get(cacheKey);
  }

  return dedupeRequest(`refresh-tokens:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildRefreshTokenPath(idRefreshToken));
    const data = unwrapResponse(response);
    refreshTokenDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createRefreshToken = async (payload) => {
  const response = await axiosInstance.post("/refresh-tokens", payload);
  const data = unwrapResponse(response);
  clearRefreshTokenCaches(data?.idRefreshToken);
  return data;
};

export const updateRefreshToken = async (idRefreshToken, payload) => {
  const response = await axiosInstance.put(buildRefreshTokenPath(idRefreshToken), payload);
  const data = unwrapResponse(response);
  clearRefreshTokenCaches(idRefreshToken);
  refreshTokenDetailCache.set(String(idRefreshToken), data);
  return data;
};

export const deleteRefreshToken = async (idRefreshToken) => {
  const response = await axiosInstance.delete(buildRefreshTokenPath(idRefreshToken));
  clearRefreshTokenCaches(idRefreshToken);
  return unwrapResponse(response);
};
