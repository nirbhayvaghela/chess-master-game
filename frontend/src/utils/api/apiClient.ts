import axios from "axios";
import { LocalStorageGetItem } from "../helpers/storageHelper";
// import { LocalStorageGetItem, SessionStorageGetItem } from "../helpers";

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // const token = Cookies.get("token");
    const token = LocalStorageGetItem("userData")?.accessToken;


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Prevent caching
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    return config;
  },
  (error) => Promise.reject(error)
);
