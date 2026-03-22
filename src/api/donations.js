import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let donationsCache = null;
const donationDetailCache = new Map();

export const clearDonationCaches = (idDonacion) => {
  donationsCache = null;

  if (idDonacion !== undefined && idDonacion !== null) {
    donationDetailCache.delete(String(idDonacion));
    return;
  }

  donationDetailCache.clear();
};

export const getDonations = async ({ force = false } = {}) => {
  if (!force && donationsCache) {
    return donationsCache;
  }

  return dedupeRequest("donations:list", async () => {
    const response = await axiosInstance.get("/donations");
    donationsCache = unwrapResponse(response);
    return donationsCache;
  });
};

export const getDonationById = async (idDonacion, { force = false } = {}) => {
  const cacheKey = String(idDonacion);

  if (!force && donationDetailCache.has(cacheKey)) {
    return donationDetailCache.get(cacheKey);
  }

  return dedupeRequest(`donations:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/donations/${idDonacion}`);
    const data = unwrapResponse(response);
    donationDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createPublicDonation = async (payload) => {
  const response = await axiosInstance.post("/donations/public", payload);
  const data = unwrapResponse(response);
  clearDonationCaches(data?.idDonacion);
  return data;
};

export const createDonation = async (payload) => {
  const response = await axiosInstance.post("/donations", payload);
  const data = unwrapResponse(response);
  clearDonationCaches(data?.idDonacion);
  return data;
};

export const updateDonation = async (idDonacion, payload) => {
  const response = await axiosInstance.put(`/donations/${idDonacion}`, payload);
  const data = unwrapResponse(response);
  clearDonationCaches(idDonacion);
  donationDetailCache.set(String(idDonacion), data);
  return data;
};

export const deleteDonation = async (idDonacion) => {
  const response = await axiosInstance.delete(`/donations/${idDonacion}`);
  clearDonationCaches(idDonacion);
  return unwrapResponse(response);
};
