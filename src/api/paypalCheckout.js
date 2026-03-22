import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? {};

export const createPayPalOrder = async ({ idCampania, monto }) => {
  const response = await axiosInstance.post("/paypal-checkout/orders", {
    idCampania,
    monto,
  });
  return unwrapResponse(response);
};

export const capturePayPalOrder = async ({ orderId, idCampania, monto, mensaje }) => {
  const response = await axiosInstance.post("/paypal-checkout/capture", {
    orderId,
    idCampania,
    monto,
    mensaje: mensaje || null,
  });
  return unwrapResponse(response);
};
