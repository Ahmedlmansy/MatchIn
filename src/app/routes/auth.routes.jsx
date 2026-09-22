import {
  ForgetPasswordPage,
  LoginPage,
  RegisterPage,
  SetNewPassword,
} from "@/features/auth";

export const auth = [
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
  { path: "reset-password", element: <SetNewPassword /> },
  { path: "forgot-password", element: <ForgetPasswordPage /> },
];
