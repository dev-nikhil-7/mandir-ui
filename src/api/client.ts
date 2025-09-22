// client.ts
import axios, { AxiosInstance } from "axios";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string, // TS needs a type assertion
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
