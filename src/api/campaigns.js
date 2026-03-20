import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let campaignsCache = null;
const campaignDetailCache = new Map();

const clearCampaignCaches = (idCampania) => {
  campaignsCache = null;

  if (idCampania !== undefined && idCampania !== null) {
    campaignDetailCache.delete(String(idCampania));
    return;
  }

  campaignDetailCache.clear();
};

export const getCampaigns = async ({ force = false } = {}) => {
  if (!force && campaignsCache) {
    return campaignsCache;
  }

  return dedupeRequest("campaigns:list", async () => {
    const response = await axiosInstance.get("/campaigns");
    campaignsCache = unwrapResponse(response);
    return campaignsCache;
  });
};

export const getCampaignById = async (idCampania, { force = false } = {}) => {
  const cacheKey = String(idCampania);

  if (!force && campaignDetailCache.has(cacheKey)) {
    return campaignDetailCache.get(cacheKey);
  }

  return dedupeRequest(`campaigns:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/campaigns/${idCampania}`);
    const data = unwrapResponse(response);
    campaignDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createCampaign = async (payload) => {
  const response = await axiosInstance.post("/campaigns", payload);
  const data = unwrapResponse(response);
  clearCampaignCaches(data?.idCampania);
  return data;
};

export const updateCampaign = async (idCampania, payload) => {
  const response = await axiosInstance.put(`/campaigns/${idCampania}`, payload);
  const data = unwrapResponse(response);
  clearCampaignCaches(idCampania);
  campaignDetailCache.set(String(idCampania), data);
  return data;
};

export const deleteCampaign = async (idCampania) => {
  const response = await axiosInstance.delete(`/campaigns/${idCampania}`);
  clearCampaignCaches(idCampania);
  return unwrapResponse(response);
};

