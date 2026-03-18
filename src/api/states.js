import axiosInstance from "./axiosConfig";
import { clearStatesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let statesCache = null;
const stateDetailCache = new Map();

const clearStateCaches = (idEstado) => {
  statesCache = null;

  if (idEstado !== undefined && idEstado !== null) {
    stateDetailCache.delete(String(idEstado));
    return;
  }

  stateDetailCache.clear();
};

const invalidateRelatedCaches = (idEstado) => {
  clearStateCaches(idEstado);
  clearStatesCache();
};

export const getStates = async ({ force = false } = {}) => {
  if (!force && statesCache) {
    return statesCache;
  }

  return dedupeRequest("states:list", async () => {
    const response = await axiosInstance.get("/states");
    statesCache = unwrapResponse(response);
    return statesCache;
  });
};

export const getStateById = async (idEstado, { force = false } = {}) => {
  const cacheKey = String(idEstado);

  if (!force && stateDetailCache.has(cacheKey)) {
    return stateDetailCache.get(cacheKey);
  }

  return dedupeRequest(`states:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/states/${idEstado}`);
    const data = unwrapResponse(response);
    stateDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createState = async (payload) => {
  const response = await axiosInstance.post("/states", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idEstado);
  return data;
};

export const updateState = async (idEstado, payload) => {
  const response = await axiosInstance.put(`/states/${idEstado}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idEstado);
  stateDetailCache.set(String(idEstado), data);
  return data;
};

export const deleteState = async (idEstado) => {
  const response = await axiosInstance.delete(`/states/${idEstado}`);
  invalidateRelatedCaches(idEstado);
  return unwrapResponse(response);
};
