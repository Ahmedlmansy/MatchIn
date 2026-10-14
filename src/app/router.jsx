import MainLayout from "@/components/layouts/MainLayout";
import HomePage from "@/features/public/pages/HomePage";
import NotFoundPage from "@/features/public/pages/NotFoundPage";

import { createBrowserRouter } from "react-router-dom";
import { auth } from "./routes/auth.routes";
import LanguageLayout from "./routes/LanguageLayout";
import RootRedirect from "./routes/RootRedirect";
import { RequireAuth } from "./routes/guards/RequireAuth";
import { RequireOnboarding } from "./routes/guards/RequireOnboarding";
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

      // Dashboard routes — must be logged in (RequireAuth), then onboarding check
      // (RequireOnboarding), then the tree for the matching role is picked from
      // Redux by <DashboardRoleTree />.
      {
        path: "dashboard",
        element: <RequireAuth />,
        children: [
          {
            element: <RequireOnboarding />,
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
    ],
  },

  // Not Found
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);