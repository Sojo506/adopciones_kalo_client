import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let otpsCache = null;
const otpDetailCache = new Map();

const buildOtpPath = (idCodigoOtp) => `/otp-codes/${idCodigoOtp}`;

const clearOtpCaches = (idCodigoOtp) => {
  otpsCache = null;

  if (idCodigoOtp !== undefined && idCodigoOtp !== null) {
    otpDetailCache.delete(String(idCodigoOtp));
    return;
  }

  otpDetailCache.clear();
};

export const invalidateOtpCaches = (idCodigoOtp = null) => {
  clearOtpCaches(idCodigoOtp);
};

export const getOtps = async ({ force = false } = {}) => {
  if (!force && otpsCache) {
    return otpsCache;
  }

  return dedupeRequest("otps:list", async () => {
    const response = await axiosInstance.get("/otp-codes");
    otpsCache = unwrapResponse(response);
    return otpsCache;
  });
};

export const getOtpById = async (idCodigoOtp, { force = false } = {}) => {
  const cacheKey = String(idCodigoOtp);

  if (!force && otpDetailCache.has(cacheKey)) {
    return otpDetailCache.get(cacheKey);
  }

  return dedupeRequest(`otps:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(buildOtpPath(idCodigoOtp));
    const data = unwrapResponse(response);
    otpDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createOtp = async (payload) => {
  const response = await axiosInstance.post("/otp-codes", payload);
  const data = unwrapResponse(response);
  invalidateOtpCaches(data?.idCodigoOtp);
  return data;
};

export const updateOtp = async (idCodigoOtp, payload) => {
  const response = await axiosInstance.put(buildOtpPath(idCodigoOtp), payload);
  const data = unwrapResponse(response);
  invalidateOtpCaches(idCodigoOtp);
  otpDetailCache.set(String(idCodigoOtp), data);
  return data;
};

export const deleteOtp = async (idCodigoOtp) => {
  const response = await axiosInstance.delete(buildOtpPath(idCodigoOtp));
  invalidateOtpCaches(idCodigoOtp);
  return unwrapResponse(response);
};
