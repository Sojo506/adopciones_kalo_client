import axiosInstance from "./axiosConfig";
import { clearTrackingTypesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let trackingTypesCache = null;
const trackingTypeDetailCache = new Map();

const clearTrackingTypeCaches = (idTipoSeguimiento) => {
  trackingTypesCache = null;

  if (idTipoSeguimiento !== undefined && idTipoSeguimiento !== null) {
    trackingTypeDetailCache.delete(String(idTipoSeguimiento));
    return;
  }

  trackingTypeDetailCache.clear();
};

const invalidateRelatedCaches = (idTipoSeguimiento) => {
  clearTrackingTypeCaches(idTipoSeguimiento);
  clearTrackingTypesCache();
};

export const getTrackingTypes = async ({ force = false } = {}) => {
  if (!force && trackingTypesCache) {
    return trackingTypesCache;
  }

  return dedupeRequest("tracking-types:list", async () => {
    const response = await axiosInstance.get("/tracking-types");
    trackingTypesCache = unwrapResponse(response);
    return trackingTypesCache;
  });
};

export const getTrackingTypeById = async (idTipoSeguimiento, { force = false } = {}) => {
  const cacheKey = String(idTipoSeguimiento);

  if (!force && trackingTypeDetailCache.has(cacheKey)) {
    return trackingTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`tracking-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/tracking-types/${idTipoSeguimiento}`);
    const data = unwrapResponse(response);
    trackingTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createTrackingType = async (payload) => {
  const response = await axiosInstance.post("/tracking-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoSeguimiento);
  return data;
};

export const updateTrackingType = async (idTipoSeguimiento, payload) => {
  const response = await axiosInstance.put(`/tracking-types/${idTipoSeguimiento}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoSeguimiento);
  trackingTypeDetailCache.set(String(idTipoSeguimiento), data);
  return data;
};

export const deleteTrackingType = async (idTipoSeguimiento) => {
  const response = await axiosInstance.delete(`/tracking-types/${idTipoSeguimiento}`);
  invalidateRelatedCaches(idTipoSeguimiento);
  return unwrapResponse(response);
};
