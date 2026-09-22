import {
  ForgetPasswordPage,
  LoginPage,
  RegisterPage,
  SetNewPassword,
} from "@/features/auth/index.js";

export const auth = [
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
  { path: "reset-password", element: <SetNewPassword /> },
  { path: "forgot-password", element: <ForgetPasswordPage /> },
];
