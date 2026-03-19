import axios from "axios";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshAccessTokenRequest = null;

const clearPersistedAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const notifySessionExpired = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }
};

const requestAccessTokenRefresh = async () => {
  if (!refreshAccessTokenRequest) {
    refreshAccessTokenRequest = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        const data = response.data?.data ?? response.data;
        const nextAccessToken = data?.accessToken || data?.token || null;

        if (nextAccessToken) {
          localStorage.setItem(AUTH_TOKEN_KEY, nextAccessToken);
        }

        return nextAccessToken;
      })
      .catch((error) => {
        clearPersistedAuth();
        notifySessionExpired();
        throw error;
      })
      .finally(() => {
        refreshAccessTokenRequest = null;
      });
  }

  return refreshAccessTokenRequest;
};

// Attach bearer token automatically if stored
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const responseStatus = error.response?.status;
    const requestUrl = String(originalRequest?.url || "");

    if (
      responseStatus !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/verify-email") ||
      requestUrl.includes("/auth/resend-verification-email") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextAccessToken = await requestAccessTokenRefresh();

      if (nextAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      }

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
