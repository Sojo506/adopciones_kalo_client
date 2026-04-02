import axiosInstance from "./axiosConfig";

const unwrapResponse = (response) => response.data?.data ?? response.data;

export const signIn = async ({ correo, usuario, identificador, password }) => {
  const identifier = usuario || identificador || correo;
  const response = await axiosInstance.post("/auth/login", { usuario: identifier, password });
  return unwrapResponse(response);
};

export const signUp = async (payload) => {
  const response = await axiosInstance.post("/auth/register", payload);
  return unwrapResponse(response);
};

export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return unwrapResponse(response);
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return unwrapResponse(response);
};

export const verifyEmail = async ({ correo, code }) => {
  const response = await axiosInstance.post("/auth/verify-email", { correo, code });
  return unwrapResponse(response);
};

export const resendVerificationEmail = async ({ correo }) => {
  const response = await axiosInstance.post("/auth/resend-verification-email", { correo });
  return unwrapResponse(response);
};

export const requestPasswordRecovery = async ({ identifier }) => {
  const response = await axiosInstance.post("/auth/forgot-password/request", { identifier });
  return unwrapResponse(response);
};

export const confirmPasswordRecovery = async ({ identifier, code, newPassword }) => {
  const response = await axiosInstance.post("/auth/forgot-password/confirm", {
    identifier,
    codigo: code,
    newPassword,
  });
  return unwrapResponse(response);
};
