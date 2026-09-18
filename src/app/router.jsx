import DashboardLayout from "@/components/layouts/auth/DashboardLayout/DashboardLayout";
import MainLayout from "@/components/layouts/auth/MainLayout";
import ForgetPage from "@/features/Auth/forgetPage/forgetPage";
import LoginPage from "@/features/Auth/LoginPage/LoginPage";
import RegisterPage from "@/features/Auth/registerPage/RegisterPage";
import SetNewPassword from "@/features/Auth/setNewPassword/pages/SetNewPassword";
import HomePage from "@/features/HomePage/HomePage";
import JobsPage from "@/features/jobs-feed/pages/JobsPage";
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
          { path: "forgot-password", element: <ForgetPage /> },
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
      {
        path: "jobs-feed",
        element: <JobsPage />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
