import axiosInstance from "./axiosConfig";
import { clearEventTypesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let eventTypesCache = null;
const eventTypeDetailCache = new Map();

const clearEventTypeCaches = (idTipoEvento) => {
  eventTypesCache = null;

  if (idTipoEvento !== undefined && idTipoEvento !== null) {
    eventTypeDetailCache.delete(String(idTipoEvento));
    return;
  }

  eventTypeDetailCache.clear();
};

const invalidateRelatedCaches = (idTipoEvento) => {
  clearEventTypeCaches(idTipoEvento);
  clearEventTypesCache();
};

export const getEventTypes = async ({ force = false } = {}) => {
  if (!force && eventTypesCache) {
    return eventTypesCache;
  }

  return dedupeRequest("event-types:list", async () => {
    const response = await axiosInstance.get("/event-types");
    eventTypesCache = unwrapResponse(response);
    return eventTypesCache;
  });
};

export const getEventTypeById = async (idTipoEvento, { force = false } = {}) => {
  const cacheKey = String(idTipoEvento);

  if (!force && eventTypeDetailCache.has(cacheKey)) {
    return eventTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`event-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/event-types/${idTipoEvento}`);
    const data = unwrapResponse(response);
    eventTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createEventType = async (payload) => {
  const response = await axiosInstance.post("/event-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoEvento);
  return data;
};

export const updateEventType = async (idTipoEvento, payload) => {
  const response = await axiosInstance.put(`/event-types/${idTipoEvento}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoEvento);
  eventTypeDetailCache.set(String(idTipoEvento), data);
  return data;
};

export const deleteEventType = async (idTipoEvento) => {
  const response = await axiosInstance.delete(`/event-types/${idTipoEvento}`);
  invalidateRelatedCaches(idTipoEvento);
  return unwrapResponse(response);
};
