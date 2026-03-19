import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let requestQuestionsCache = null;
const requestQuestionDetailCache = new Map();

const normalizeRequestQuestionKey = (idSolicitud, idPregunta) =>
  `${String(idSolicitud)}:${String(idPregunta)}`;

export const clearRequestQuestionCaches = (idSolicitud, idPregunta) => {
  requestQuestionsCache = null;

  if (
    idSolicitud !== undefined &&
    idSolicitud !== null &&
    idPregunta !== undefined &&
    idPregunta !== null
  ) {
    requestQuestionDetailCache.delete(normalizeRequestQuestionKey(idSolicitud, idPregunta));
    return;
  }

  requestQuestionDetailCache.clear();
};

export const getRequestQuestions = async ({ force = false } = {}) => {
  if (!force && requestQuestionsCache) {
    return requestQuestionsCache;
  }

  return dedupeRequest("request-questions:list", async () => {
    const response = await axiosInstance.get("/request-questions");
    requestQuestionsCache = unwrapResponse(response);
    return requestQuestionsCache;
  });
};

export const getRequestQuestionByPk = async (
  idSolicitud,
  idPregunta,
  { force = false } = {},
) => {
  const cacheKey = normalizeRequestQuestionKey(idSolicitud, idPregunta);

  if (!force && requestQuestionDetailCache.has(cacheKey)) {
    return requestQuestionDetailCache.get(cacheKey);
  }

  return dedupeRequest(`request-questions:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/request-questions/${idSolicitud}/${idPregunta}`);
    const data = unwrapResponse(response);
    requestQuestionDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createRequestQuestion = async (payload) => {
  const response = await axiosInstance.post("/request-questions", payload);
  const data = unwrapResponse(response);
  clearRequestQuestionCaches(data?.idSolicitud, data?.idPregunta);
  return data;
};

export const updateRequestQuestion = async (idSolicitud, idPregunta, payload) => {
  const response = await axiosInstance.put(
    `/request-questions/${idSolicitud}/${idPregunta}`,
    payload,
  );
  const data = unwrapResponse(response);
  clearRequestQuestionCaches(idSolicitud, idPregunta);
  requestQuestionDetailCache.set(normalizeRequestQuestionKey(idSolicitud, idPregunta), data);
  return data;
};

export const deleteRequestQuestion = async (idSolicitud, idPregunta) => {
  const response = await axiosInstance.delete(`/request-questions/${idSolicitud}/${idPregunta}`);
  clearRequestQuestionCaches(idSolicitud, idPregunta);
  return unwrapResponse(response);
};
