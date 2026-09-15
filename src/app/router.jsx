import MainLayout from "@/components/layouts/auth/MainLayout";
import ForgetPage from "@/features/Auth/forgetPage/forgetPage";
import LoginPage from "@/features/Auth/LoginPage/LoginPage";
import RegisterPage from "@/features/Auth/registerPage/RegisterPage";
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
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "/auth",
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          {path:"forgot-password" , element:<ForgetPage/>}
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);




