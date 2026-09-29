import { api } from "@/services/axios/axiosInstance";



// POST /api/auth/register
export const registerRequest = (payload) =>
  api.post("/api/auth/register", payload).then((res) => res.data);

// POST /api/auth/verify-email-otp
export const verifyEmailOtpRequest = (payload) =>
  api.post("/auth/verify-email-otp", payload).then((res) => res.data);

// POST /api/auth/resend-email-otp
export const resendEmailOtpRequest = (payload) =>
  api.post("/auth/resend-email-otp", payload).then((res) => res.data);

// POST /api/auth/login
export const loginRequest = (payload) =>
  api.post("/auth/login", payload).then((res) => res.data);

