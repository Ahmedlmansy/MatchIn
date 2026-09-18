import NotificationsPage from "@/features/notifications/NotificationsPage";
import Overview from "@/features/userDashboard/overview/Overview";

export const dashboard = [ {
        index: true,
        element: <Overview />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },]