import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let dogEventsCache = null;
const dogEventDetailCache = new Map();

const buildDogEventPath = (idEvento) => `/dog-events/${idEvento}`;

export const clearDogEventCaches = (idEvento) => {
  dogEventsCache = null;

  if (idEvento !== undefined && idEvento !== null) {
    dogEventDetailCache.delete(String(idEvento));
    return;
  }

  dogEventDetailCache.clear();
};

export const getDogEvents = async ({ force = false } = {}) => {
  if (!force && dogEventsCache) {
    return dogEventsCache;
  }

  return dedupeRequest("dog-events:list", async () => {
    const response = await axiosInstance.get("/dog-events");
    dogEventsCache = unwrapResponse(response);
    return dogEventsCache;
  });
};

export const getDogEventById = async (idEvento, { force = false } = {}) => {
  const cacheKey = String(idEvento);

  if (!force && dogEventDetailCache.has(cacheKey)) {
    return dogEventDetailCache.get(cacheKey);
  }

  return dedupeRequest(`dog-events:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildDogEventPath(idEvento));
    const data = unwrapResponse(response);
    dogEventDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createDogEvent = async (payload) => {
  const response = await axiosInstance.post("/dog-events", payload);
  const data = unwrapResponse(response);
  clearDogEventCaches(data?.idEvento);
  return data;
};

export const updateDogEvent = async (idEvento, payload) => {
  const response = await axiosInstance.put(buildDogEventPath(idEvento), payload);
  const data = unwrapResponse(response);
  clearDogEventCaches(idEvento);
  dogEventDetailCache.set(String(idEvento), data);
  return data;
};

export const deleteDogEvent = async (idEvento) => {
  const response = await axiosInstance.delete(buildDogEventPath(idEvento));
  clearDogEventCaches(idEvento);
  return unwrapResponse(response);
};
