import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let responsesCache = null;
const responseDetailCache = new Map();

const clearResponseCaches = (idRespuesta) => {
  responsesCache = null;

  if (idRespuesta !== undefined && idRespuesta !== null) {
    responseDetailCache.delete(String(idRespuesta));
    return;
  }

  responseDetailCache.clear();
};

export const getResponses = async ({ force = false } = {}) => {
  if (!force && responsesCache) {
    return responsesCache;
  }

  return dedupeRequest("responses:list", async () => {
    const response = await axiosInstance.get("/responses");
    responsesCache = unwrapResponse(response);
    return responsesCache;
  });
};

export const getResponseById = async (idRespuesta, { force = false } = {}) => {
  const cacheKey = String(idRespuesta);

  if (!force && responseDetailCache.has(cacheKey)) {
    return responseDetailCache.get(cacheKey);
  }

  return dedupeRequest(`responses:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/responses/${idRespuesta}`);
    const data = unwrapResponse(response);
    responseDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createResponse = async (payload) => {
  const response = await axiosInstance.post("/responses", payload);
  const data = unwrapResponse(response);
  clearResponseCaches(data?.idRespuesta);
  return data;
};

export const updateResponse = async (idRespuesta, payload) => {
  const response = await axiosInstance.put(`/responses/${idRespuesta}`, payload);
  const data = unwrapResponse(response);
  clearResponseCaches(idRespuesta);
  responseDetailCache.set(String(idRespuesta), data);
  return data;
};

export const deleteResponse = async (idRespuesta) => {
  const response = await axiosInstance.delete(`/responses/${idRespuesta}`);
  clearResponseCaches(idRespuesta);
  return unwrapResponse(response);
};
