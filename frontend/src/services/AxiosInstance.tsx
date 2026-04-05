import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:3000";

export const Axios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

Axios.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      Cookies.remove("authToken");
      // window.location.href = "/registration/signin";
    }
    
    if (error.response?.status === 403) {
      alert("Please verify your email first!");
      // window.location.href = "/registration/otp-verification";
    }

    return Promise.reject(error);
  }
);