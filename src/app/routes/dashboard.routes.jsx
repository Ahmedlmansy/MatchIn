import { LayoutDashboard, Compass, Bell, FileText, Bot } from "lucide-react";
import JobsPage from "@/features/jobs-feed/pages/JobsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import Overview from "@/features/userDashboard/overview/Overview";
import CvManagementPage from "@/features/userDashboard/CvManagementPage/CvManagementPage";
import AiChat from "@/features/ai-chat/AiChatPage";
import RoadmapPage from "@/features/roadmap/RoadmapPage";
import RoadmapDetails from "@/features/roadmap/roadmapDetails/RoadmapDetails";

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
  {
    path: "cv-management",
    element: <CvManagementPage />,
    handle: { label: "Cv Management", icon: FileText, sidebar: true },
  },
  {
    path: "ai-chat",
    element: <AiChat />,
    handle: { label: "AI Chat", icon: Bot, sidebar: true },
  },
  {
    path: "roadmap",
    element: <RoadmapPage />,
    handle: { label: "Roadmap", icon: Compass, sidebar: true },
  },
  {
    path: "roadmap/:roleId",
    element: <RoadmapDetails />,
  },
];
