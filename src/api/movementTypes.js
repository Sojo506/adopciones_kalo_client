import axiosInstance from "./axiosConfig";
import { clearMovementTypesCache } from "./catalogs";
import { clearInventoryMovementCaches } from "./inventoryMovements";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let movementTypesCache = null;
const movementTypeDetailCache = new Map();

const clearMovementTypeCaches = (idTipoMovimiento) => {
  movementTypesCache = null;

  if (idTipoMovimiento !== undefined && idTipoMovimiento !== null) {
    movementTypeDetailCache.delete(String(idTipoMovimiento));
    return;
  }

  movementTypeDetailCache.clear();
};

const invalidateRelatedCaches = (idTipoMovimiento) => {
  clearMovementTypeCaches(idTipoMovimiento);
  clearMovementTypesCache();
  clearInventoryMovementCaches();
};

export const getMovementTypes = async ({ force = false } = {}) => {
  if (!force && movementTypesCache) {
    return movementTypesCache;
  }

  return dedupeRequest("movement-types:list", async () => {
    const response = await axiosInstance.get("/movement-types");
    movementTypesCache = unwrapResponse(response);
    return movementTypesCache;
  });
};

export const getMovementTypeById = async (idTipoMovimiento, { force = false } = {}) => {
  const cacheKey = String(idTipoMovimiento);

  if (!force && movementTypeDetailCache.has(cacheKey)) {
    return movementTypeDetailCache.get(cacheKey);
  }

  return dedupeRequest(`movement-types:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/movement-types/${idTipoMovimiento}`);
    const data = unwrapResponse(response);
    movementTypeDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createMovementType = async (payload) => {
  const response = await axiosInstance.post("/movement-types", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idTipoMovimiento);
  return data;
};

export const updateMovementType = async (idTipoMovimiento, payload) => {
  const response = await axiosInstance.put(`/movement-types/${idTipoMovimiento}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idTipoMovimiento);
  movementTypeDetailCache.set(String(idTipoMovimiento), data);
  return data;
};

export const deleteMovementType = async (idTipoMovimiento) => {
  const response = await axiosInstance.delete(`/movement-types/${idTipoMovimiento}`);
  invalidateRelatedCaches(idTipoMovimiento);
  return unwrapResponse(response);
};
