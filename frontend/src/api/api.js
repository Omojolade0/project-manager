import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then((response) => {
        const newToken = response.data.access_token;
        localStorage.setItem("token", newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthAttempt =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !isAuthAttempt &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (refreshError.response?.status === 401) {
          // refresh token itself was actually rejected — real logout
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        // else: network error / 500 / timeout — don't destroy the session,
        // just let this request fail and reject normally
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
