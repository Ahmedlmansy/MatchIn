
import axios from "axios";

// The one app-wide client (convention §4.2). The session token is an httpOnly
// cookie the backend sets on login / email verification, so JS never holds it
// — `withCredentials` is what makes the browser attach it to every call.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});