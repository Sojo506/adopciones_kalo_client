import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data;

export const submitAdoptionRequest = async (payload) => {
  const response = await axiosInstance.post("/adoption-requests", payload);
  return unwrapResponse(response);
};

export const checkPendingAdoption = async (idPerrito) => {
  const response = await axiosInstance.get("/adoption-requests/check", {
    params: { idPerrito },
  });
  return unwrapResponse(response);
};
