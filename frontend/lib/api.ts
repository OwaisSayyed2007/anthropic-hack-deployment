import axios, { AxiosInstance } from "axios";
 
declare module "axios" {
  export interface AxiosInstance {
    stream: (url: string, data: any) => Promise<Response>;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


// Add a custom stream helper since Axios doesn't handle browser streams natively
(api as any).stream = async (url: string, data: any) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
  const response = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return response;
};
