import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? {};

export const createStoreOrder = async ({ total }) => {
  const response = await axiosInstance.post("/store-checkout/orders", { total });
  return unwrapResponse(response);
};

export const captureStoreOrder = async ({ orderId, items }) => {
  const response = await axiosInstance.post("/store-checkout/capture", {
    orderId,
    items,
  });
  return unwrapResponse(response);
};
