import axiosInstance from "./axiosConfig";
import { clearDogEventCaches } from "./dogEvents";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let eventDetailsCache = null;
const eventDetailsByEventCache = new Map();
const eventDetailCache = new Map();

const buildEventDetailPath = (idDetalleEvento) => `/event-details/${idDetalleEvento}`;
const buildEventDetailsByEventPath = (idEvento) => `/event-details/event/${idEvento}`;

export const clearEventDetailCaches = ({
  idDetalleEvento = null,
  eventIds = [],
} = {}) => {
  eventDetailsCache = null;

  if (idDetalleEvento !== undefined && idDetalleEvento !== null) {
    eventDetailCache.delete(String(idDetalleEvento));
  } else if (!Array.isArray(eventIds) || eventIds.length === 0) {
    eventDetailCache.clear();
  }

  if (Array.isArray(eventIds) && eventIds.length > 0) {
    eventIds.forEach((idEvento) => {
      if (idEvento !== undefined && idEvento !== null) {
        eventDetailsByEventCache.delete(String(idEvento));
      }
    });
    return;
  }

  eventDetailsByEventCache.clear();
};

export const getEventDetails = async ({ force = false } = {}) => {
  if (!force && eventDetailsCache) {
    return eventDetailsCache;
  }

  return dedupeRequest("event-details:list", async () => {
    const response = await axiosInstance.get("/event-details");
    eventDetailsCache = unwrapResponse(response);
    return eventDetailsCache;
  });
};

export const getEventDetailsByEvent = async (idEvento, { force = false } = {}) => {
  const cacheKey = String(idEvento);

  if (!force && eventDetailsByEventCache.has(cacheKey)) {
    return eventDetailsByEventCache.get(cacheKey);
  }

  return dedupeRequest(`event-details:event:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildEventDetailsByEventPath(idEvento));
    const data = unwrapResponse(response);
    eventDetailsByEventCache.set(cacheKey, data);
    return data;
  });
};

export const getEventDetailById = async (idDetalleEvento, { force = false } = {}) => {
  const cacheKey = String(idDetalleEvento);

  if (!force && eventDetailCache.has(cacheKey)) {
    return eventDetailCache.get(cacheKey);
  }

  return dedupeRequest(`event-details:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildEventDetailPath(idDetalleEvento));
    const data = unwrapResponse(response);
    eventDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createEventDetail = async (formData) => {
  const response = await axiosInstance.post("/event-details", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const data = unwrapResponse(response);
  clearEventDetailCaches({
    idDetalleEvento: data?.idDetalleEvento,
    eventIds: data?.idEvento ? [data.idEvento] : [],
  });
  clearDogEventCaches(data?.idEvento);
  return data;
};

export const updateEventDetail = async (idDetalleEvento, formData) => {
  const response = await axiosInstance.put(buildEventDetailPath(idDetalleEvento), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const data = unwrapResponse(response);
  clearEventDetailCaches();
  clearDogEventCaches();
  if (data) {
    eventDetailCache.set(String(idDetalleEvento), data);
  }
  return data;
};

export const deleteEventDetail = async (idDetalleEvento, { idEvento } = {}) => {
  const response = await axiosInstance.delete(buildEventDetailPath(idDetalleEvento));
  clearEventDetailCaches({
    idDetalleEvento,
    eventIds: idEvento ? [idEvento] : [],
  });
  clearDogEventCaches(idEvento);
  return unwrapResponse(response);
};
