import axiosInstance from "./axiosConfig";
import { clearCategoriesCache } from "./catalogs";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let categoriesCache = null;
const categoryDetailCache = new Map();

const clearCategoryCaches = (idCategoria) => {
  categoriesCache = null;

  if (idCategoria !== undefined && idCategoria !== null) {
    categoryDetailCache.delete(String(idCategoria));
    return;
  }

  categoryDetailCache.clear();
};

const invalidateRelatedCaches = (idCategoria) => {
  clearCategoryCaches(idCategoria);
  clearCategoriesCache();
};

export const getCategories = async ({ force = false } = {}) => {
  if (!force && categoriesCache) {
    return categoriesCache;
  }

  return dedupeRequest("categories:list", async () => {
    const response = await axiosInstance.get("/categories");
    categoriesCache = unwrapResponse(response);
    return categoriesCache;
  });
};

export const getCategoryById = async (idCategoria, { force = false } = {}) => {
  const cacheKey = String(idCategoria);

  if (!force && categoryDetailCache.has(cacheKey)) {
    return categoryDetailCache.get(cacheKey);
  }

  return dedupeRequest(`categories:detail:${cacheKey}`, async () => {
    const response = await axiosInstance.get(`/categories/${idCategoria}`);
    const data = unwrapResponse(response);
    categoryDetailCache.set(cacheKey, data);
    return data;
  });
};

export const createCategory = async (payload) => {
  const response = await axiosInstance.post("/categories", payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(data?.idCategoria);
  return data;
};

export const updateCategory = async (idCategoria, payload) => {
  const response = await axiosInstance.put(`/categories/${idCategoria}`, payload);
  const data = unwrapResponse(response);
  invalidateRelatedCaches(idCategoria);
  categoryDetailCache.set(String(idCategoria), data);
  return data;
};

export const deleteCategory = async (idCategoria) => {
  const response = await axiosInstance.delete(`/categories/${idCategoria}`);
  invalidateRelatedCaches(idCategoria);
  return unwrapResponse(response);
};
