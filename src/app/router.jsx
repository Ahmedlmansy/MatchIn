import MainLayout from "@/components/layouts/MainLayout";
import HomePage from "@/features/public/pages/HomePage";
import NotFoundPage from "@/features/public/pages/NotFoundPage";

import { createBrowserRouter } from "react-router-dom";
import { auth } from "./routes/auth.routes";
import LanguageLayout from "./routes/LanguageLayout";
import RootRedirect from "./routes/RootRedirect";
import { RequireAuth } from "./routes/guards/RequireAuth";
import { DashboardRoleTree } from "./routes/guards/DashboardRoleTree";

export const router = createBrowserRouter([
  // Root redirect
  {
    path: "/",
    element: <RootRedirect />,
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

      // Dashboard routes — must be logged in (RequireAuth), then the tree for
      // the matching role is picked from Redux by <DashboardRoleTree />.
      // DashboardLayout no longer takes hardcoded userName/userRole props — it
      // reads the real user from Redux internally, same as every other
      // authenticated screen.
      {
        path: "dashboard",
        element: <RequireAuth />,
        children: [
          // Two entries pointing at the same component: the index matches the
          // dashboard root (/dashboard), the splat matches everything beneath
          // it (/dashboard/job-management, ...). A single pathless child with
          // no children of its own would never match at all, and
          // "dashboard/*" would not match "/dashboard" without the slash.
          { index: true, element: <DashboardRoleTree /> },
          { path: "*", element: <DashboardRoleTree /> },
        ],
      },
    ],
  },

  // Not Found
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);