import axiosInstance from "./axiosConfig";
import { invalidateProductCaches } from "./products";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let inventoriesCache = null;
const inventoryDetailCache = new Map();

export const clearInventoryCaches = (idInventario) => {
  inventoriesCache = null;

  if (idInventario !== undefined && idInventario !== null) {
    inventoryDetailCache.delete(String(idInventario));
    return;
  }

  inventoryDetailCache.clear();
};

const invalidateRelatedCaches = (idInventario, idProducto) => {
  clearInventoryCaches(idInventario);
  invalidateProductCaches(idProducto);
};

export const getInventories = async ({ force = false } = {}) => {
  if (!force && inventoriesCache) {
    return inventoriesCache;
  }

  return dedupeRequest("inventories:list", async () => {
    const response = await axiosInstance.get("/inventories");
    inventoriesCache = unwrapResponse(response);
    return inventoriesCache;
  });
};

export const getInventoryById = async (idInventario, { force = false } = {}) => {
  const cacheKey = String(idInventario);

  if (!force && inventoryDetailCache.has(cacheKey)) {
    return inventoryDetailCache.get(cacheKey);
  }

  return dedupeRequest(`inventories:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/inventories/${idInventario}`);
    const data = unwrapResponse(response);
    inventoryDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createInventory = async (payload) => {
  const response = await axiosInstance.post("/inventories", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idInventario, data?.idProducto);
  return data;
};

export const updateInventory = async (idInventario, payload) => {
  const response = await axiosInstance.put(`/inventories/${idInventario}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idInventario, data?.idProducto);
  inventoryDetailCache.set(String(idInventario), data);
  return data;
};

export const deleteInventory = async (idInventario, { idProducto } = {}) => {
  const response = await axiosInstance.delete(`/inventories/${idInventario}`);
  invalidateRelatedCaches(idInventario, idProducto);
  return unwrapResponse(response);
};
