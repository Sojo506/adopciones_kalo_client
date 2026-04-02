import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data;
let adoptionRequestFormBootstrapCache = null;

export const clearAdoptionRequestBootstrapCache = () => {
  adoptionRequestFormBootstrapCache = null;
};

export const getAdoptionRequestFormBootstrap = async ({ force = false } = {}) => {
  if (!force && adoptionRequestFormBootstrapCache) {
    return adoptionRequestFormBootstrapCache;
  }

  const requestKey = force
    ? "adoption-requests:bootstrap:force"
    : "adoption-requests:bootstrap";

  return dedupeRequest(requestKey, async () => {
    const response = await axiosInstance.get("/adoption-requests/bootstrap", {
      params: force ? { force: "true", _ts: Date.now() } : undefined,
    });
    adoptionRequestFormBootstrapCache = unwrapResponse(response);
    return adoptionRequestFormBootstrapCache;
  });
};

export const submitAdoptionRequest = async (payload) => {
  const response = await axiosInstance.post("/adoption-requests", payload);
  return unwrapResponse(response);
};

export const checkPendingAdoption = async (idPerrito) => {
  const response = await axiosInstance.get("/adoption-requests/check", {
    params: { idPerrito },
  });
  return unwrapResponse(response);
};
