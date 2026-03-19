import axiosInstance from "./axiosConfig";
import { clearOtpTypesCache } from "./catalogs";
import { invalidateOtpCaches } from "./otps";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let otpTypesCache = null;
const otpTypeDetailCache = new Map();

const clearOtpTypeCaches = (idTipoOtp) => {
  otpTypesCache = null;

  if (idTipoOtp !== undefined && idTipoOtp !== null) {
    otpTypeDetailCache.delete(String(idTipoOtp));
    return;
  }

  otpTypeDetailCache.clear();
};

const invalidateRelatedCaches = (idTipoOtp) => {
  clearOtpTypeCaches(idTipoOtp);
  clearOtpTypesCache();
  invalidateOtpCaches();
};

export const getOtpTypes = async ({ force = false } = {}) => {
  if (!force && otpTypesCache) {
    return otpTypesCache;
  }

  return dedupeRequest("otp-types:list", async () => {
    const response = await axiosInstance.get("/otp-types");
    otpTypesCache = unwrapResponse(response);
    return otpTypesCache;
  });
};

export const getOtpTypeById = async (idTipoOtp, { force = false } = {}) => {
  const cacheKey = String(idTipoOtp);

  if (!force && otpTypeDetailCache.has(cacheKey)) {
    return otpTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`otp-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/otp-types/${idTipoOtp}`);
    const data = unwrapResponse(response);
    otpTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createOtpType = async (payload) => {
  const response = await axiosInstance.post("/otp-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoOtp);
  return data;
};

export const updateOtpType = async (idTipoOtp, payload) => {
  const response = await axiosInstance.put(`/otp-types/${idTipoOtp}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoOtp);
  otpTypeDetailCache.set(String(idTipoOtp), data);
  return data;
};

export const deleteOtpType = async (idTipoOtp) => {
  const response = await axiosInstance.delete(`/otp-types/${idTipoOtp}`);
  invalidateRelatedCaches(idTipoOtp);
  return unwrapResponse(response);
};
