import axios from "axios";

export const API = (() => {
  if (process.env.NODE_ENV === "production") return "/api";
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl && !envUrl.includes("localhost")) return envUrl + "/api";
  return `http://${window.location.hostname}:8000/api`;
})();

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage as Bearer fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mechlib_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(err, fallback = "Something went wrong") {
  const data = err?.response?.data;
  const detail = data?.detail || data?.message;

  if (!detail) return err?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => (typeof e === 'string' ? e : (e?.msg || JSON.stringify(e)))).join(" ");
  }
  if (detail?.msg) return detail.msg;
  return fallback;
}
