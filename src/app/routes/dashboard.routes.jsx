import { LayoutDashboard, Compass, Bell } from "lucide-react";
import JobsPage from "@/features/jobs-feed/pages/JobsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import Overview from "@/features/userDashboard/overview/Overview";

export const dashboard = [
  {
    index: true,
    element: <Overview />,
    handle: { label: "Dashboard", icon: LayoutDashboard, sidebar: true },
  },
  {
    path: "notifications",
    element: <NotificationsPage />,
    handle: { label: "Notifications", icon: Bell, sidebar: false },
  },
  {
    path: "jobs-feed",
    element: <JobsPage />,
    handle: { label: "Explore Jobs", icon: Compass, sidebar: true },
  },

];
