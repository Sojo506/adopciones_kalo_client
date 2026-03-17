import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? [];

export const getUsers = async () => {
  const response = await axiosInstance.get("/auth");
  return unwrapResponse(response);
};

export const getUserByIdentification = async (identificacion) => {
  const response = await axiosInstance.get(`/auth/${identificacion}`);
  return unwrapResponse(response);
};

export const createUser = async (payload) => {
  const response = await axiosInstance.post("/auth", payload);
  return unwrapResponse(response);
};

export const updateUser = async (identificacion, payload) => {
  const response = await axiosInstance.put(`/auth/${identificacion}`, payload);
  return unwrapResponse(response);
};

export const deleteUser = async (identificacion) => {
  const response = await axiosInstance.delete(`/auth/${identificacion}`);
  return unwrapResponse(response);
};
