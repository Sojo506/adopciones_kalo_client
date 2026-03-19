import axiosInstance from "./axiosConfig";
import { clearQuestionsCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let questionsCache = null;
const questionDetailCache = new Map();

const clearQuestionCaches = (idPregunta) => {
  questionsCache = null;

  if (idPregunta !== undefined && idPregunta !== null) {
    questionDetailCache.delete(String(idPregunta));
    return;
  }

  questionDetailCache.clear();
};

const invalidateRelatedCaches = (idPregunta) => {
  clearQuestionCaches(idPregunta);
  clearQuestionsCache();
};

export const getQuestions = async ({ force = false } = {}) => {
  if (!force && questionsCache) {
    return questionsCache;
  }

  return dedupeRequest("questions:list", async () => {
    const response = await axiosInstance.get("/questions");
    questionsCache = unwrapResponse(response);
    return questionsCache;
  });
};

export const getQuestionById = async (idPregunta, { force = false } = {}) => {
  const cacheKey = String(idPregunta);

  if (!force && questionDetailCache.has(cacheKey)) {
    return questionDetailCache.get(cacheKey);
  }

  return dedupeRequest(`questions:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/questions/${idPregunta}`);
    const data = unwrapResponse(response);
    questionDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createQuestion = async (payload) => {
  const response = await axiosInstance.post("/questions", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idPregunta);
  return data;
};

export const updateQuestion = async (idPregunta, payload) => {
  const response = await axiosInstance.put(`/questions/${idPregunta}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idPregunta);
  questionDetailCache.set(String(idPregunta), data);
  return data;
};

export const deleteQuestion = async (idPregunta) => {
  const response = await axiosInstance.delete(`/questions/${idPregunta}`);
  invalidateRelatedCaches(idPregunta);
  return unwrapResponse(response);
};
