import axiosInstance from "./axiosConfig";
import { clearRequestTypesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let requestTypesCache = null;
const requestTypeDetailCache = new Map();

const clearRequestTypeCaches = (idTipoSolicitud) => {
  requestTypesCache = null;

  if (idTipoSolicitud !== undefined && idTipoSolicitud !== null) {
    requestTypeDetailCache.delete(String(idTipoSolicitud));
    return;
  }

  requestTypeDetailCache.clear();
};

const invalidateRelatedCaches = (idTipoSolicitud) => {
  clearRequestTypeCaches(idTipoSolicitud);
  clearRequestTypesCache();
};

export const getRequestTypes = async ({ force = false } = {}) => {
  if (!force && requestTypesCache) {
    return requestTypesCache;
  }

  return dedupeRequest("request-types:list", async () => {
    const response = await axiosInstance.get("/request-types");
    requestTypesCache = unwrapResponse(response);
    return requestTypesCache;
  });
};

export const getRequestTypeById = async (idTipoSolicitud, { force = false } = {}) => {
  const cacheKey = String(idTipoSolicitud);

  if (!force && requestTypeDetailCache.has(cacheKey)) {
    return requestTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`request-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/request-types/${idTipoSolicitud}`);
    const data = unwrapResponse(response);
    requestTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createRequestType = async (payload) => {
  const response = await axiosInstance.post("/request-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoSolicitud);
  return data;
};

export const updateRequestType = async (idTipoSolicitud, payload) => {
  const response = await axiosInstance.put(`/request-types/${idTipoSolicitud}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoSolicitud);
  requestTypeDetailCache.set(String(idTipoSolicitud), data);
  return data;
};

export const deleteRequestType = async (idTipoSolicitud) => {
  const response = await axiosInstance.delete(`/request-types/${idTipoSolicitud}`);
  invalidateRelatedCaches(idTipoSolicitud);
  return unwrapResponse(response);
};
