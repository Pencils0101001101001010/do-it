import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  {
    const token = localStorage.getItem("token");

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const isAuthEndpoint =
      err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register");

    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);
export default api;
