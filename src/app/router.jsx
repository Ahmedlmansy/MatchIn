import DashboardLayout from "@/components/layouts/auth/DashboardLayout/DashboardLayout";
import MainLayout from "@/components/layouts/auth/MainLayout";
import HomePage from "@/features/HomePage/HomePage";
import NotFoundPage from "@/features/NotFoundPage/NotFoundPage";

import { createBrowserRouter } from "react-router-dom";
import { auth } from "./routes/auth.routes";
import { dashboard } from "./routes/dashboard.routes";

export const router = createBrowserRouter([
  {
    //  guest routes
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/auth",
        children: [...auth],
      },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout userName="Alex Mercer" userRole="Senior Dev" />,
    children: [...dashboard],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
