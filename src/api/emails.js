import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let emailsCache = null;
const emailDetailCache = new Map();

const buildEmailCacheKey = (identificacion, correo) =>
  `${String(identificacion).trim()}:${String(correo).trim().toLowerCase()}`;

const buildEmailPath = (identificacion, correo) =>
  `/emails/${identificacion}/${encodeURIComponent(String(correo).trim())}`;

const clearEmailCaches = (identificacion, correo) => {
  emailsCache = null;

  if (identificacion !== undefined && identificacion !== null && correo) {
    emailDetailCache.delete(buildEmailCacheKey(identificacion, correo));
    return;
  }

  emailDetailCache.clear();
};

export const getEmails = async ({ force = false } = {}) => {
  if (!force && emailsCache) {
    return emailsCache;
  }

  return dedupeRequest("emails:list", async () => {
    const response = await axiosInstance.get("/emails");
    emailsCache = unwrapResponse(response);
    return emailsCache;
  });
};

export const getEmailByPk = async (identificacion, correo, { force = false } = {}) => {
  const cacheKey = buildEmailCacheKey(identificacion, correo);

  if (!force && emailDetailCache.has(cacheKey)) {
    return emailDetailCache.get(cacheKey);
  }

  return dedupeRequest(`emails:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildEmailPath(identificacion, correo));
    const data = unwrapResponse(response);
    emailDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createEmail = async (payload) => {
  const response = await axiosInstance.post("/emails", payload);
  const data = unwrapResponse(response);
  clearEmailCaches(data?.identificacion, data?.correo);
  return data;
};

export const updateEmail = async (identificacion, correo, payload) => {
  const response = await axiosInstance.put(buildEmailPath(identificacion, correo), payload);
  const data = unwrapResponse(response);
  clearEmailCaches(identificacion, correo);
  emailDetailCache.set(buildEmailCacheKey(identificacion, correo), data);
  return data;
};

export const deleteEmail = async (identificacion, correo) => {
  const response = await axiosInstance.delete(buildEmailPath(identificacion, correo));
  clearEmailCaches(identificacion, correo);
  return unwrapResponse(response);
};
