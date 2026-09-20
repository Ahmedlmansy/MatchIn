import { LayoutDashboard, Compass, Bell, FileText, Bot, Bookmark,PersonStanding ,ClipboardList} from "lucide-react";
import JobsPage from "@/features/jobsFeed/pages/JobsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import Overview from "@/features/userDashboard/overview/Overview";
import CvManagementPage from "@/features/userDashboard/CvManagementPage/CvManagementPage";
import RoadmapPage from "@/features/roadmap/RoadmapPage";
import AiChat from "@/features/aiChat/AiChatPage";
import JobDetailsPage from "@/features/jobsFeed/pages/JobsDetails";
import RoadmapDetailsPage from "@/features/roadmap/roadmapDetails/RoadmapDetailsPage";
import OnboardingPage from "@/features/onboarding/OnboardingPage";
import SavedJobsDashboard from "@/features/jobsFeed/pages/SavedJobs";
import ProfilePage from "@/features/profile/ProfilePage";
import ApplicationTracker from "@/features/applications/pages/ApplicationPage";
import ApplicationDetails from "@/features/applications/pages/ApplicationDetail";


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
    path: "profile",
    element: <ProfilePage />,
    handle: { label: "Profile", icon: PersonStanding, sidebar: false },
  },
  {
    path: "jobs",
    handle: { label: "Explore Jobs", icon: Compass, sidebar: true },
    children: [
      { index: true, element: <JobsPage /> },
      { path: ":jobId", element: <JobDetailsPage /> },
    ],
  },
  {
    path: "saved-jobs",
    element: <SavedJobsDashboard />,
    handle: { label: "Saved Jobs", icon: Bookmark, sidebar: true },
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
    handle: { label: "Roadmap", icon: Compass, sidebar: true },
    children: [
      { index: true, element: <RoadmapPage /> },
      { path: ":roleId", element: <RoadmapDetailsPage /> },
    ],
  },
  {
    path: "onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "applications",
    handle: {
      label: "Application Tracker",
      icon: ClipboardList,
      sidebar: true,
    },
    children: [
      {index: true, element: <ApplicationTracker />},
      {path: ":applicationId", element: <ApplicationDetails />}
    ]
  }
]
   

