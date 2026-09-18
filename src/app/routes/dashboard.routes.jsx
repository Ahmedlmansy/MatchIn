import JobsPage from "@/features/jobs-feed/pages/JobsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import Overview from "@/features/userDashboard/overview/Overview";
import path from "node:path";

export const dashboard = [ {
        index: true,
        element: <Overview />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "jobs-feed",
        element: <JobsPage />
      }
    ]