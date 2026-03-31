import axiosInstance from "./axiosConfig";
import { invalidateFollowUpCaches } from "./followUps";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let evidencesCache = null;
const evidenceDetailCache = new Map();
const evidencesByFollowUpCache = new Map();
const isFormDataPayload = (value) => typeof FormData !== "undefined" && value instanceof FormData;

const clearEvidenceCaches = ({ idEvidencia = null, idSeguimiento = null } = {}) => {
  evidencesCache = null;

  if (idEvidencia !== undefined && idEvidencia !== null) {
    evidenceDetailCache.delete(String(idEvidencia));
  } else {
    evidenceDetailCache.clear();
  }

  if (idSeguimiento !== undefined && idSeguimiento !== null) {
    evidencesByFollowUpCache.delete(String(idSeguimiento));
  } else {
    evidencesByFollowUpCache.clear();
  }
};

const invalidateRelatedCaches = ({ idEvidencia = null, idSeguimiento = null } = {}) => {
  clearEvidenceCaches({ idEvidencia, idSeguimiento });
  invalidateFollowUpCaches(idSeguimiento);
};

export const getEvidences = async ({ force = false } = {}) => {
  if (!force && evidencesCache) {
    return evidencesCache;
  }

  return dedupeRequest("evidences:list", async () => {
    const response = await axiosInstance.get("/evidences");
    evidencesCache = unwrapResponse(response);
    return evidencesCache;
  });
};

export const getEvidencesByFollowUp = async (idSeguimiento, { force = false } = {}) => {
  const cacheKey = String(idSeguimiento);

  if (!force && evidencesByFollowUpCache.has(cacheKey)) {
    return evidencesByFollowUpCache.get(cacheKey);
  }

  return dedupeRequest(`evidences:follow-up:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/evidences/follow-up/${idSeguimiento}`);
    const data = unwrapResponse(response);
    evidencesByFollowUpCache.set(cacheKey, data);
    return data;
  });
};

export const getEvidenceById = async (idEvidencia, { force = false } = {}) => {
  const cacheKey = String(idEvidencia);

  if (!force && evidenceDetailCache.has(cacheKey)) {
    return evidenceDetailCache.get(cacheKey);
  }

  return dedupeRequest(`evidences:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/evidences/${idEvidencia}`);
    const data = unwrapResponse(response);
    evidenceDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createEvidence = async (payload) => {
  const response = await axiosInstance.post(
    "/evidences",
    payload,
    isFormDataPayload(payload)
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : undefined,
  );
  const data = unwrapResponse(response);
  invalidateRelatedCaches({
    idEvidencia: data?.idEvidencia,
    idSeguimiento: data?.idSeguimiento,
  });
  if (data?.idEvidencia !== undefined && data?.idEvidencia !== null) {
    evidenceDetailCache.set(String(data.idEvidencia), data);
  }
  return data;
};

export const updateEvidence = async (idEvidencia, payload) => {
  const response = await axiosInstance.put(
    `/evidences/${idEvidencia}`,
    payload,
    isFormDataPayload(payload)
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : undefined,
  );
  const data = unwrapResponse(response);
  clearEvidenceCaches();
  invalidateFollowUpCaches();
  if (data) {
    evidenceDetailCache.set(String(idEvidencia), data);
  }
  return data;
};

export const deleteEvidence = async (idEvidencia, { idSeguimiento } = {}) => {
  const response = await axiosInstance.delete(`/evidences/${idEvidencia}`);
  invalidateRelatedCaches({ idEvidencia, idSeguimiento });
  return unwrapResponse(response);
};
