import axiosInstance from "./axiosConfig";
import { clearDistrictsCache } from "./locations";
import { dedupeRequest } from "./requestCache";
import { invalidateUsersCache } from "./users";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let districtsCache = null;
const districtDetailCache = new Map();

const clearDistrictCaches = (idDistrito) => {
  districtsCache = null;

  if (idDistrito !== undefined && idDistrito !== null) {
    districtDetailCache.delete(String(idDistrito));
    return;
  }

  districtDetailCache.clear();
};

const invalidateRelatedCaches = (idDistrito) => {
  clearDistrictCaches(idDistrito);
  clearDistrictsCache();
  invalidateUsersCache();
};

export const getDistricts = async ({ force = false } = {}) => {
  if (!force && districtsCache) {
    return districtsCache;
  }

  return dedupeRequest("districts:list", async () => {
    const response = await axiosInstance.get("/districts");
    districtsCache = unwrapResponse(response);
    return districtsCache;
  });
};

export const getDistrictById = async (idDistrito, { force = false } = {}) => {
  const cacheKey = String(idDistrito);

  if (!force && districtDetailCache.has(cacheKey)) {
    return districtDetailCache.get(cacheKey);
  }

  return dedupeRequest(`districts:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/districts/${idDistrito}`);
    const data = unwrapResponse(response);
    districtDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createDistrict = async (payload) => {
  const response = await axiosInstance.post("/districts", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idDistrito);
  return data;
};

export const updateDistrict = async (idDistrito, payload) => {
  const response = await axiosInstance.put(`/districts/${idDistrito}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idDistrito);
  districtDetailCache.set(String(idDistrito), data);
  return data;
};

export const deleteDistrict = async (idDistrito) => {
  const response = await axiosInstance.delete(`/districts/${idDistrito}`);
  invalidateRelatedCaches(idDistrito);
  return unwrapResponse(response);
};
