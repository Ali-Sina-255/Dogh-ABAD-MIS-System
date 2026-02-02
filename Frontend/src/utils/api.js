import axios from "axios";
import { showErrorToast } from "../Components/messages/Toast";
const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log(BASE_URL);

const getToken = () => localStorage.getItem("auth_token");

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Attach token before each request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      showErrorToast("Session expired. Please login again.");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export { axiosInstance, getToken };
