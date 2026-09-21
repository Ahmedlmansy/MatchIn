import DashboardLayout from "@/components/layouts/auth/DashboardLayout/DashboardLayout";
import MainLayout from "@/components/layouts/auth/MainLayout";
import HomePage from "@/features/HomePage/HomePage";
import NotFoundPage from "@/features/NotFoundPage/NotFoundPage";

import { createBrowserRouter, Navigate } from "react-router-dom";
import { auth } from "./routes/auth.routes";
import { dashboard } from "./routes/dashboard.routes";
import RootRedirect from "./routes/RootRedirect";

export const router = createBrowserRouter([
  // Root redirect
  {
    path: "/",
    element:<RootRedirect />,
  },

  // Language routes
  {
    path: "/:lang",
    children: [
      // Guest routes
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "auth",
            children: [...auth],
          },
        ],
      },

      // Dashboard routes
      {
        path: "dashboard",
        element: (
          <DashboardLayout userName="Alex Mercer" userRole="Senior Dev" />
        ),
        children: [...dashboard],
      },
    ],
  },

  // Not Found
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
