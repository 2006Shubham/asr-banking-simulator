import axios from "axios";

/**
 * ASR Bank - Central Axios API Instance
 * Default base URL targets the Spring Boot backend server (http://localhost:8080).
 *
 * During initial frontend development, mock data from src/data/mockData.js
 * is consumed by services. When Spring Boot is ready, this client takes over.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor (for future JWT or auth tokens)
api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem("asr_bank_session");
    if (session) {
      try {
        const { token } = JSON.parse(session);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to parse auth token", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("asr_bank_session");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
