import AuthLayout from "@/components/layouts/auth/AuthLayout";
import MainLayout from "@/components/layouts/auth/MainLayout";
import LoginPage from "@/features/Auth/LoginPage/LoginPage";
import HomePage from "@/features/HomePage/HomePage";
import NotFoundPage from "@/features/NotFoundPage/NotFoundPage";

import {
  createBrowserRouter,
  RouterProvider,

} from "react-router-dom";







export const router = createBrowserRouter([
  {
    //  guest routes
    path: "/",
    element: (
        <MainLayout />
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/auth",
        children: [
          { path: "login", element: <LoginPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <NotFoundPage />
    ),
  },
]);




