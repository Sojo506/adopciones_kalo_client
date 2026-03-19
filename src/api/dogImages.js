import axiosInstance from "./axiosConfig";
import { invalidateDogCaches } from "./dogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
const dogImagesByDogCache = new Map();
const dogImageDetailCache = new Map();

export const clearDogImageCaches = (idPerrito) => {
  if (idPerrito !== undefined && idPerrito !== null) {
    dogImagesByDogCache.delete(String(idPerrito));
  } else {
    dogImagesByDogCache.clear();
  }

  dogImageDetailCache.clear();
};

export const getDogImagesByDog = async (idPerrito, { force = false } = {}) => {
  const cacheKey = String(idPerrito);

  if (!force && dogImagesByDogCache.has(cacheKey)) {
    return dogImagesByDogCache.get(cacheKey);
  }

  return dedupeRequest(`dog-images:list:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/dog-images/dog/${idPerrito}`);
    const data = unwrapResponse(response);
    dogImagesByDogCache.set(cacheKey, data);
    return data;
  });
};

export const getDogImageById = async (idImagen, { force = false } = {}) => {
  const cacheKey = String(idImagen);

  if (!force && dogImageDetailCache.has(cacheKey)) {
    return dogImageDetailCache.get(cacheKey);
  }

  return dedupeRequest(`dog-images:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/dog-images/${idImagen}`);
    const data = unwrapResponse(response);
    dogImageDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createDogImage = async (formData) => {
  const response = await axiosInstance.post("/dog-images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const data = unwrapResponse(response);
  clearDogImageCaches(data?.idPerrito);
  invalidateDogCaches(data?.idPerrito);
  if (data?.idImagen !== undefined && data?.idImagen !== null) {
    dogImageDetailCache.set(String(data.idImagen), data);
  }
  return data;
};

export const updateDogImage = async (idImagen, formData) => {
  const response = await axiosInstance.put(`/dog-images/${idImagen}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const data = unwrapResponse(response);
  clearDogImageCaches();
  invalidateDogCaches();
  if (data) {
    dogImageDetailCache.set(String(idImagen), data);
  }
  return data;
};

export const deleteDogImage = async (idImagen, { idPerrito } = {}) => {
  const response = await axiosInstance.delete(`/dog-images/${idImagen}`);
  clearDogImageCaches(idPerrito);
  invalidateDogCaches(idPerrito);
  dogImageDetailCache.delete(String(idImagen));
  return unwrapResponse(response);
};
