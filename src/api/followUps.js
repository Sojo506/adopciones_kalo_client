import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let followUpsCache = null;
const followUpDetailCache = new Map();

const clearFollowUpCaches = (idSeguimiento) => {
  followUpsCache = null;

  if (idSeguimiento !== undefined && idSeguimiento !== null) {
    followUpDetailCache.delete(String(idSeguimiento));
    return;
  }

  followUpDetailCache.clear();
};

export const invalidateFollowUpCaches = (idSeguimiento) => {
  clearFollowUpCaches(idSeguimiento);
};

export const getFollowUps = async ({ force = false } = {}) => {
  if (!force && followUpsCache) {
    return followUpsCache;
  }

  return dedupeRequest("follow-ups:list", async () => {
    const response = await axiosInstance.get("/follow-ups");
    followUpsCache = unwrapResponse(response);
    return followUpsCache;
  });
};

export const getFollowUpById = async (idSeguimiento, { force = false } = {}) => {
  const cacheKey = String(idSeguimiento);

  if (!force && followUpDetailCache.has(cacheKey)) {
    return followUpDetailCache.get(cacheKey);
  }

  return dedupeRequest(`follow-ups:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/follow-ups/${idSeguimiento}`);
    const data = unwrapResponse(response);
    followUpDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createFollowUp = async (payload) => {
  const response = await axiosInstance.post("/follow-ups", payload);
  const data = unwrapResponse(response);
  clearFollowUpCaches(data?.idSeguimiento);
  return data;
};

export const updateFollowUp = async (idSeguimiento, payload) => {
  const response = await axiosInstance.put(`/follow-ups/${idSeguimiento}`, payload);
  const data = unwrapResponse(response);
  clearFollowUpCaches(idSeguimiento);
  followUpDetailCache.set(String(idSeguimiento), data);
  return data;
};

export const deleteFollowUp = async (idSeguimiento) => {
  const response = await axiosInstance.delete(`/follow-ups/${idSeguimiento}`);
  clearFollowUpCaches(idSeguimiento);
  return unwrapResponse(response);
};
