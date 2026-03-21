import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let requestQuestionsCache = null;
const requestQuestionDetailCache = new Map();
const requestQuestionsByTypeCache = new Map();

const normalizeRequestQuestionKey = (idTipoSolicitud, idPregunta) =>
  `${String(idTipoSolicitud)}:${String(idPregunta)}`;

export const clearRequestQuestionCaches = (idTipoSolicitud, idPregunta) => {
  requestQuestionsCache = null;
  requestQuestionsByTypeCache.clear();

  if (
    idTipoSolicitud !== undefined &&
    idTipoSolicitud !== null &&
    idPregunta !== undefined &&
    idPregunta !== null
  ) {
    requestQuestionDetailCache.delete(normalizeRequestQuestionKey(idTipoSolicitud, idPregunta));
    return;
  }

  requestQuestionDetailCache.clear();
};

export const getRequestQuestions = async ({ force = false } = {}) => {
  if (!force && requestQuestionsCache) {
    return requestQuestionsCache;
  }

  return dedupeRequest("request-type-questions:list", async () => {
    const response = await axiosInstance.get("/request-type-questions");
    requestQuestionsCache = unwrapResponse(response);
    return requestQuestionsCache;
  });
};

export const getRequestQuestionByPk = async (
  idTipoSolicitud,
  idPregunta,
  { force = false } = {},
) => {
  const cacheKey = normalizeRequestQuestionKey(idTipoSolicitud, idPregunta);

  if (!force && requestQuestionDetailCache.has(cacheKey)) {
    return requestQuestionDetailCache.get(cacheKey);
  }

  return dedupeRequest(`request-type-questions:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(
      `/request-type-questions/${idTipoSolicitud}/${idPregunta}`,
    );
    const data = unwrapResponse(response);
    requestQuestionDetailCache.set(cacheKey, data);
    return data;
  });
};

export const getActiveQuestionsByRequestType = async (
  idTipoSolicitud,
  { force = false } = {},
) => {
  const cacheKey = String(idTipoSolicitud);

  if (!force && requestQuestionsByTypeCache.has(cacheKey)) {
    return requestQuestionsByTypeCache.get(cacheKey);
  }

  return dedupeRequest(`request-type-questions:type:${cacheKey}`, async () => {
    const response = await axiosInstance.get(
      `/request-type-questions/request-types/${idTipoSolicitud}/questions`,
    );
    const data = unwrapResponse(response);
    requestQuestionsByTypeCache.set(cacheKey, data);
    return data;
  });
};

export const createRequestQuestion = async (payload) => {
  const response = await axiosInstance.post("/request-type-questions", payload);
  const data = unwrapResponse(response);
  clearRequestQuestionCaches(data?.idTipoSolicitud, data?.idPregunta);
  return data;
};

export const updateRequestQuestion = async (idTipoSolicitud, idPregunta, payload) => {
  const response = await axiosInstance.put(
    `/request-type-questions/${idTipoSolicitud}/${idPregunta}`,
    payload,
  );
  const data = unwrapResponse(response);
  clearRequestQuestionCaches(idTipoSolicitud, idPregunta);
  requestQuestionDetailCache.set(
    normalizeRequestQuestionKey(idTipoSolicitud, idPregunta),
    data,
  );
  return data;
};

export const deleteRequestQuestion = async (idTipoSolicitud, idPregunta) => {
  const response = await axiosInstance.delete(
    `/request-type-questions/${idTipoSolicitud}/${idPregunta}`,
  );
  clearRequestQuestionCaches(idTipoSolicitud, idPregunta);
  return unwrapResponse(response);
};
