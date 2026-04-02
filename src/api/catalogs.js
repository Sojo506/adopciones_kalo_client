import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];
let userTypesCache = null;
let statesCache = null;
let otpTypesCache = null;
let categoriesCache = null;
let brandsCache = null;
let movementTypesCache = null;
let productsCache = null;
let storeCatalogCache = null;
let currenciesCache = null;
let breedsCache = null;
let sexesCache = null;
let requestTypesCache = null;
let responseTypesCache = null;
let trackingTypesCache = null;
let eventTypesCache = null;
let questionsCache = null;
const catalogProductDetailCache = new Map();

export const clearUserTypesCache = () => {
  userTypesCache = null;
};

export const clearStatesCache = () => {
  statesCache = null;
};

export const clearOtpTypesCache = () => {
  otpTypesCache = null;
};

export const clearCategoriesCache = () => {
  categoriesCache = null;
};

export const clearBrandsCache = () => {
  brandsCache = null;
};

export const clearMovementTypesCache = () => {
  movementTypesCache = null;
};

export const clearProductsCache = () => {
  productsCache = null;
  storeCatalogCache = null;
  catalogProductDetailCache.clear();
};

export const clearCurrenciesCache = () => {
  currenciesCache = null;
};

export const clearBreedsCache = () => {
  breedsCache = null;
};

export const clearSexesCache = () => {
  sexesCache = null;
};

export const clearRequestTypesCache = () => {
  requestTypesCache = null;
};

export const clearResponseTypesCache = () => {
  responseTypesCache = null;
};

export const clearTrackingTypesCache = () => {
  trackingTypesCache = null;
};

export const clearEventTypesCache = () => {
  eventTypesCache = null;
};

export const clearQuestionsCache = () => {
  questionsCache = null;
};

export const getUserTypes = async ({ force = false } = {}) => {
  if (!force && userTypesCache) {
    return userTypesCache;
  }

  return dedupeRequest("catalogs:user-types", async () => {
    const response = await axiosInstance.get("/catalogs/user-types");
    userTypesCache = unwrapResponse(response);
    return userTypesCache;
  });
};

export const getStates = async ({ force = false } = {}) => {
  if (!force && statesCache) {
    return statesCache;
  }

  return dedupeRequest("catalogs:states", async () => {
    const response = await axiosInstance.get("/catalogs/states");
    statesCache = unwrapResponse(response);
    return statesCache;
  });
};

export const getOtpTypes = async ({ force = false } = {}) => {
  if (!force && otpTypesCache) {
    return otpTypesCache;
  }

  return dedupeRequest("catalogs:otp-types", async () => {
    const response = await axiosInstance.get("/catalogs/otp-types");
    otpTypesCache = unwrapResponse(response);
    return otpTypesCache;
  });
};

export const getCategories = async ({ force = false } = {}) => {
  if (!force && categoriesCache) {
    return categoriesCache;
  }

  return dedupeRequest("catalogs:categories", async () => {
    const response = await axiosInstance.get("/catalogs/categories");
    categoriesCache = unwrapResponse(response);
    return categoriesCache;
  });
};

export const getBrands = async ({ force = false } = {}) => {
  if (!force && brandsCache) {
    return brandsCache;
  }

  return dedupeRequest("catalogs:brands", async () => {
    const response = await axiosInstance.get("/catalogs/brands");
    brandsCache = unwrapResponse(response);
    return brandsCache;
  });
};

export const getMovementTypes = async ({ force = false } = {}) => {
  if (!force && movementTypesCache) {
    return movementTypesCache;
  }

  return dedupeRequest("catalogs:movement-types", async () => {
    const response = await axiosInstance.get("/catalogs/movement-types");
    movementTypesCache = unwrapResponse(response);
    return movementTypesCache;
  });
};

export const getProducts = async ({ force = false } = {}) => {
  if (!force && productsCache) {
    return productsCache;
  }

  const requestKey = force ? "catalogs:products:force" : "catalogs:products";

  return dedupeRequest(requestKey, async () => {
    const response = await axiosInstance.get("/catalogs/products", {
      params: force ? { force: "true", _ts: Date.now() } : undefined,
    });
    productsCache = unwrapResponse(response);
    return productsCache;
  });
};

export const getStoreCatalog = async ({ force = false } = {}) => {
  if (!force && storeCatalogCache) {
    return storeCatalogCache;
  }

  const requestKey = force ? "catalogs:store:force" : "catalogs:store";

  return dedupeRequest(requestKey, async () => {
    const response = await axiosInstance.get("/catalogs/store", {
      params: force ? { force: "true", _ts: Date.now() } : undefined,
    });
    storeCatalogCache = response.data?.data ?? response.data ?? {
      products: [],
      categories: [],
      brands: [],
    };
    return storeCatalogCache;
  });
};

export const getCatalogProductById = async (idProducto, { force = false } = {}) => {
  const cacheKey = String(idProducto);

  if (!force && catalogProductDetailCache.has(cacheKey)) {
    return catalogProductDetailCache.get(cacheKey);
  }

  const requestKey = force
    ? `catalogs:products:detail:${cacheKey}:force`
    : `catalogs:products:detail:${cacheKey}`;

  return dedupeRequest(requestKey, async () => {
    const response = await axiosInstance.get(`/catalogs/products/${idProducto}`, {
      params: force ? { force: "true", _ts: Date.now() } : undefined,
    });
    const data = unwrapResponse(response);
    catalogProductDetailCache.set(cacheKey, data);
    return data;
  });
};

export const getCurrencies = async ({ force = false } = {}) => {
  if (!force && currenciesCache) {
    return currenciesCache;
  }

  return dedupeRequest("catalogs:currencies", async () => {
    const response = await axiosInstance.get("/catalogs/currencies");
    currenciesCache = unwrapResponse(response);
    return currenciesCache;
  });
};

export const getBreeds = async ({ force = false } = {}) => {
  if (!force && breedsCache) {
    return breedsCache;
  }

  return dedupeRequest("catalogs:breeds", async () => {
    const response = await axiosInstance.get("/catalogs/breeds");
    breedsCache = unwrapResponse(response);
    return breedsCache;
  });
};

export const getSexes = async ({ force = false } = {}) => {
  if (!force && sexesCache) {
    return sexesCache;
  }

  return dedupeRequest("catalogs:sexes", async () => {
    const response = await axiosInstance.get("/catalogs/sexes");
    sexesCache = unwrapResponse(response);
    return sexesCache;
  });
};

export const getRequestTypes = async ({ force = false } = {}) => {
  if (!force && requestTypesCache) {
    return requestTypesCache;
  }

  return dedupeRequest("catalogs:request-types", async () => {
    const response = await axiosInstance.get("/catalogs/request-types");
    requestTypesCache = unwrapResponse(response);
    return requestTypesCache;
  });
};

export const getResponseTypes = async ({ force = false } = {}) => {
  if (!force && responseTypesCache) {
    return responseTypesCache;
  }

  return dedupeRequest("catalogs:response-types", async () => {
    const response = await axiosInstance.get("/catalogs/response-types");
    responseTypesCache = unwrapResponse(response);
    return responseTypesCache;
  });
};

export const getTrackingTypes = async ({ force = false } = {}) => {
  if (!force && trackingTypesCache) {
    return trackingTypesCache;
  }

  return dedupeRequest("catalogs:tracking-types", async () => {
    const response = await axiosInstance.get("/catalogs/tracking-types");
    trackingTypesCache = unwrapResponse(response);
    return trackingTypesCache;
  });
};

export const getEventTypes = async ({ force = false } = {}) => {
  if (!force && eventTypesCache) {
    return eventTypesCache;
  }

  return dedupeRequest("catalogs:event-types", async () => {
    const response = await axiosInstance.get("/catalogs/event-types");
    eventTypesCache = unwrapResponse(response);
    return eventTypesCache;
  });
};

export const getQuestions = async ({ force = false } = {}) => {
  if (!force && questionsCache) {
    return questionsCache;
  }

  return dedupeRequest("catalogs:questions", async () => {
    const response = await axiosInstance.get("/catalogs/questions");
    questionsCache = unwrapResponse(response);
    return questionsCache;
  });
};
