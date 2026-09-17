import DashboardLayout from "@/components/layouts/auth/DashboardLayout/DashboardLayout";
import MainLayout from "@/components/layouts/auth/MainLayout";
import LoginPage from "@/features/Auth/LoginPage/LoginPage";
import RegisterPage from "@/features/Auth/registerPage/RegisterPage";
import SetNewPassword from "@/features/Auth/setNewPassword/pages/SetNewPassword";
import HomePage from "@/features/HomePage/HomePage";
import NotFoundPage from "@/features/NotFoundPage/NotFoundPage";
import Overview from "@/features/userDashboard/overview/Overview";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

export const router = createBrowserRouter([
  {
    //  guest routes
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/auth",
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "set-new-password", element: <SetNewPassword /> },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout userName="Alex Mercer" userRole="Senior Dev" />,
    children: [
      {
        index: true,
        element: <Overview />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
