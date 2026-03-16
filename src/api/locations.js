import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];

export const getCountries = async () => {
  const response = await axiosInstance.get("/locations/countries");
  return unwrapResponse(response);
};

export const getProvinces = async (idPais) => {
  const response = await axiosInstance.get("/locations/provinces", { params: { idPais } });
  return unwrapResponse(response);
};

export const getCantons = async (idProvincia) => {
  const response = await axiosInstance.get("/locations/cantons", { params: { idProvincia } });
  return unwrapResponse(response);
};

export const getDistricts = async (idCanton) => {
  const response = await axiosInstance.get("/locations/districts", { params: { idCanton } });
  return unwrapResponse(response);
};
