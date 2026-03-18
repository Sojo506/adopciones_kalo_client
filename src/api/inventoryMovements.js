import { invalidateProductCaches } from "./products";
import { clearInventoryCaches } from "./inventories";
import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let movementsCache = null;
let movementTypesCache = null;
const movementDetailCache = new Map();

export const clearInventoryMovementCaches = (idMovimiento) => {
  movementsCache = null;
  movementTypesCache = null;

  if (idMovimiento !== undefined && idMovimiento !== null) {
    movementDetailCache.delete(String(idMovimiento));
    return;
  }

  movementDetailCache.clear();
};

const invalidateRelatedCaches = (idMovimiento, idProducto) => {
  clearInventoryMovementCaches(idMovimiento);
  clearInventoryCaches();
  invalidateProductCaches(idProducto);
};

export const getInventoryMovements = async ({ force = false } = {}) => {
  if (!force && movementsCache) {
    return movementsCache;
  }

  return dedupeRequest("inventory-movements:list", async () => {
    const response = await axiosInstance.get("/inventory-movements");
    movementsCache = unwrapResponse(response);
    return movementsCache;
  });
};

export const getInventoryMovementById = async (idMovimiento, { force = false } = {}) => {
  const cacheKey = String(idMovimiento);

  if (!force && movementDetailCache.has(cacheKey)) {
    return movementDetailCache.get(cacheKey);
  }

  return dedupeRequest(`inventory-movements:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/inventory-movements/${idMovimiento}`);
    const data = unwrapResponse(response);
    movementDetailCache.set(cacheKey, data);
    return data;
  });
};

export const getInventoryMovementTypes = async ({ force = false } = {}) => {
  if (!force && movementTypesCache) {
    return movementTypesCache;
  }

  return dedupeRequest("inventory-movements:types", async () => {
    const response = await axiosInstance.get("/inventory-movements/types");
    movementTypesCache = unwrapResponse(response);
    return movementTypesCache;
  });
};

export const createInventoryMovement = async (payload) => {
  const response = await axiosInstance.post("/inventory-movements", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idMovimiento, data?.idProducto);
  return data;
};

export const updateInventoryMovement = async (idMovimiento, payload) => {
  const response = await axiosInstance.put(`/inventory-movements/${idMovimiento}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idMovimiento, data?.idProducto);
  movementDetailCache.set(String(idMovimiento), data);
  return data;
};

export const deleteInventoryMovement = async (idMovimiento, { idProducto } = {}) => {
  const response = await axiosInstance.delete(`/inventory-movements/${idMovimiento}`);
  invalidateRelatedCaches(idMovimiento, idProducto);
  return unwrapResponse(response);
};
