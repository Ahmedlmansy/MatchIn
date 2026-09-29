import { api } from "@/services/axios/axiosInstance"

// Posts { email } to the reset endpoint; resolves with the normalized server payload, rejects with the axios error.
export const forgotPassword = async (payload) => {
    const { data } = await api.post("/api/auth/forgot-password", payload)
    return data;
}

// Posts { email, code } to the OTP endpoint; resolves with { token } for the next step, rejects with the axios error.
export const verifyOtp = async (payload) => {
    const { data } = await api.post("/api/auth/verify-otp", payload)
    // Normalize the raw server shape here so no hook/Redux ever stores it (convention §4.5).
    const body = data?.data ?? data;
    return { token: body?.token ?? body?.access_token ?? null };
}

// Posts { email } to the OTP resend endpoint; resolves with the normalized server payload, rejects with the axios error.
export const resendOtp = async (payload) => {
    const { data } = await api.post("/api/auth/resend-otp", payload)
    return data;
}

// Posts { email, token, password, password_confirmation } to the reset endpoint; resolves with the normalized server payload, rejects with the axios error.
export const resetPassword = async (payload) => {
    const { data } = await api.post("/api/auth/reset-password", payload)
    return data;
}
