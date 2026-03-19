import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let houseDogsCache = null;
const houseDogDetailCache = new Map();

const normalizeHouseDogKey = (idCasaCuna, idPerrito) =>
  `${String(idCasaCuna)}:${String(idPerrito)}`;

export const clearHouseDogCaches = (idCasaCuna, idPerrito) => {
  houseDogsCache = null;

  if (
    idCasaCuna !== undefined &&
    idCasaCuna !== null &&
    idPerrito !== undefined &&
    idPerrito !== null
  ) {
    houseDogDetailCache.delete(normalizeHouseDogKey(idCasaCuna, idPerrito));
    return;
  }

  houseDogDetailCache.clear();
};

export const getHouseDogs = async ({ force = false } = {}) => {
  if (!force && houseDogsCache) {
    return houseDogsCache;
  }

  return dedupeRequest("house-dogs:list", async () => {
    const response = await axiosInstance.get("/house-dogs");
    houseDogsCache = unwrapResponse(response);
    return houseDogsCache;
  });
};

export const getHouseDogByPk = async (idCasaCuna, idPerrito, { force = false } = {}) => {
  const cacheKey = normalizeHouseDogKey(idCasaCuna, idPerrito);

  if (!force && houseDogDetailCache.has(cacheKey)) {
    return houseDogDetailCache.get(cacheKey);
  }

  return dedupeRequest(`house-dogs:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/house-dogs/${idCasaCuna}/${idPerrito}`);
    const data = unwrapResponse(response);
    houseDogDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createHouseDog = async (payload) => {
  const response = await axiosInstance.post("/house-dogs", payload);
  const data = unwrapResponse(response);
  clearHouseDogCaches(data?.idCasaCuna, data?.idPerrito);
  return data;
};

export const updateHouseDog = async (idCasaCuna, idPerrito, payload) => {
  const response = await axiosInstance.put(`/house-dogs/${idCasaCuna}/${idPerrito}`, payload);
  const data = unwrapResponse(response);
  clearHouseDogCaches(idCasaCuna, idPerrito);
  houseDogDetailCache.set(normalizeHouseDogKey(idCasaCuna, idPerrito), data);
  return data;
};

export const deleteHouseDog = async (idCasaCuna, idPerrito) => {
  const response = await axiosInstance.delete(`/house-dogs/${idCasaCuna}/${idPerrito}`);
  clearHouseDogCaches(idCasaCuna, idPerrito);
  return unwrapResponse(response);
};
