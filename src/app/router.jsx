import MainLayout from "@/components/layouts/auth/MainLayout";
import DashboardLayout from "@/components/layouts/auth/DashboardLayout/DashboardLayout";
import HomePage from "@/features/HomePage/HomePage";
import NotFoundPage from "@/features/NotFoundPage/NotFoundPage";

import { createBrowserRouter } from "react-router-dom";
import { auth } from "./routes/auth.routes";
import { dashboard } from "./routes/dashboard.routes";
import LanguageLayout from "./routes/LanguageLayout";
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
    element: <LanguageLayout />,
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
