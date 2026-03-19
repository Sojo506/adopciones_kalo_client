import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let requestsCache = null;
const requestDetailCache = new Map();

const clearRequestCaches = (idSolicitud) => {
  requestsCache = null;

  if (idSolicitud !== undefined && idSolicitud !== null) {
    requestDetailCache.delete(String(idSolicitud));
    return;
  }

  requestDetailCache.clear();
};

export const invalidateRequestCaches = (idSolicitud) => {
  clearRequestCaches(idSolicitud);
};

export const getRequests = async ({ force = false } = {}) => {
  if (!force && requestsCache) {
    return requestsCache;
  }

  return dedupeRequest("requests:list", async () => {
    const response = await axiosInstance.get("/requests");
    requestsCache = unwrapResponse(response);
    return requestsCache;
  });
};

export const getRequestById = async (idSolicitud, { force = false } = {}) => {
  const cacheKey = String(idSolicitud);

  if (!force && requestDetailCache.has(cacheKey)) {
    return requestDetailCache.get(cacheKey);
  }

  return dedupeRequest(`requests:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/requests/${idSolicitud}`);
    const data = unwrapResponse(response);
    requestDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createRequest = async (payload) => {
  const response = await axiosInstance.post("/requests", payload);
  const data = unwrapResponse(response);
  clearRequestCaches(data?.idSolicitud);
  return data;
};

export const updateRequest = async (idSolicitud, payload) => {
  const response = await axiosInstance.put(`/requests/${idSolicitud}`, payload);
  const data = unwrapResponse(response);
  clearRequestCaches(idSolicitud);
  requestDetailCache.set(String(idSolicitud), data);
  return data;
};

export const deleteRequest = async (idSolicitud) => {
  const response = await axiosInstance.delete(`/requests/${idSolicitud}`);
  clearRequestCaches(idSolicitud);
  return unwrapResponse(response);
};
