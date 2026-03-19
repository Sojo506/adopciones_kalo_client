import axiosInstance from "./axiosConfig";
import { clearResponseTypesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let responseTypesCache = null;
const responseTypeDetailCache = new Map();

const clearResponseTypeCaches = (idTipoRespuesta) => {
  responseTypesCache = null;

  if (idTipoRespuesta !== undefined && idTipoRespuesta !== null) {
    responseTypeDetailCache.delete(String(idTipoRespuesta));
    return;
  }

  responseTypeDetailCache.clear();
};

const invalidateRelatedCaches = (idTipoRespuesta) => {
  clearResponseTypeCaches(idTipoRespuesta);
  clearResponseTypesCache();
};

export const getResponseTypes = async ({ force = false } = {}) => {
  if (!force && responseTypesCache) {
    return responseTypesCache;
  }

  return dedupeRequest("response-types:list", async () => {
    const response = await axiosInstance.get("/response-types");
    responseTypesCache = unwrapResponse(response);
    return responseTypesCache;
  });
};

export const getResponseTypeById = async (idTipoRespuesta, { force = false } = {}) => {
  const cacheKey = String(idTipoRespuesta);

  if (!force && responseTypeDetailCache.has(cacheKey)) {
    return responseTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`response-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/response-types/${idTipoRespuesta}`);
    const data = unwrapResponse(response);
    responseTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createResponseType = async (payload) => {
  const response = await axiosInstance.post("/response-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoRespuesta);
  return data;
};

export const updateResponseType = async (idTipoRespuesta, payload) => {
  const response = await axiosInstance.put(`/response-types/${idTipoRespuesta}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoRespuesta);
  responseTypeDetailCache.set(String(idTipoRespuesta), data);
  return data;
};

export const deleteResponseType = async (idTipoRespuesta) => {
  const response = await axiosInstance.delete(`/response-types/${idTipoRespuesta}`);
  invalidateRelatedCaches(idTipoRespuesta);
  return unwrapResponse(response);
};
