import {
  LayoutDashboard,
  Compass,
  Bell,
  FileText,
  Bot,
  Bookmark,
  PersonStanding,
  ClipboardList,
  BriefcaseBusiness,
  Users,
  List,
  ShieldCheck,
  Building,
} from "lucide-react";
import AiChatPage from "@/features/candidate/pages/AiChatPage";
import ApplicationDetail from "@/features/candidate/pages/ApplicationDetail";
import ApplicationPage from "@/features/candidate/pages/ApplicationPage";
import CvManagementPage from "@/features/candidate/pages/CvManagementPage";
import JobsDetails from "@/features/candidate/pages/JobsDetails";
import JobsPage from "@/features/candidate/pages/JobsPage";
import NotificationsPage from "@/features/candidate/pages/NotificationsPage";
import OnboardingPage from "@/features/candidate/pages/OnboardingPage";
import Overview from "@/features/candidate/pages/Overview";
import ProfilePage from "@/features/candidate/pages/ProfilePage";
import RoadmapDetailsPage from "@/features/candidate/pages/RoadmapDetailsPage";
import RoadmapPage from "@/features/candidate/pages/RoadmapPage";
import SavedJobs from "@/features/candidate/pages/SavedJobs";
import AdminOverview from "@/features/admin/pages/AdminOverview";
import JobManagement from "@/features/admin/pages/JobManagement";
import { UsersDetailsPage } from "@/features/admin/pages/UsersDetailsPage";
import { UserManagementPage } from "@/features/admin/pages/UserManagementPage";
import { JobDetailsPage } from "@/features/admin/pages/JobDetailsPage";
import AuditLogsList from "@/features/admin/pages/AuditLogsPage";
import AuditLogDetails from "@/features/admin/pages/AuditLogsDetailsPage";
import CmsHomePage from "@/features/admin/pages/CmsHomePage";
import AuthSettingsPage from "@/features/admin/pages/AuthSettingsPage";
import CompanyDetails from "@/features/admin/pages/CompaniesDetailsPage";
import CompaniesPage from "@/features/admin/pages/CompaniesPage";

// No hardcoded role here anymore. Both trees are always defined; which one
// renders is decided at request time by <RequireRole allow={[...]} /> in the
// router file, reading the real role from Redux — not by picking an array
// once at import time.
import EditJobs from "@/features/admin/pages/EditJobs";

// Which tree renders is decided at request time by <DashboardRoleTree /> in the
// router file, reading the real role from Redux — not by picking an array once
// at import time. (The old `const role = 'user'` here meant the candidate tree
// was exported as `dashboard` while admins could never be routed.)

export const candidateDashboardRoutes = [
  {
    index: true,
    element: <Overview />,
    handle: {
      label: "Dashboard",
      labelKey: "navigation.dashboard",
      icon: LayoutDashboard,
      sidebar: true,
    },
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
    handle: {
      label: "Explore Jobs",
      labelKey: "navigation.exploreJobs",
      icon: Compass,
      sidebar: true,
    },
    children: [
      { index: true, element: <JobsPage /> },
      { path: ":jobId", element: <JobsDetails /> },
    ],
  },
  {
    path: "saved-jobs",
    element: <SavedJobs />,
    handle: {
      label: "Saved Jobs",
      labelKey: "navigation.savedJobs",
      icon: Bookmark,
      sidebar: true,
    },
  },
  {
    path: "cv-management",
    element: <CvManagementPage />,
    handle: {
      label: "Cv Management",
      labelKey: "navigation.cvManagement",
      icon: FileText,
      sidebar: true,
    },
  },
  {
    path: "ai-chat",
    element: <AiChatPage />,
    handle: {
      label: "AI Chat",
      labelKey: "navigation.aiChat",
      icon: Bot,
      sidebar: true,
    },
  },
  {
    path: "roadmap",
    handle: {
      label: "Roadmap",
      labelKey: "navigation.roadmap",
      icon: Compass,
      sidebar: true,
    },
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
      labelKey: "navigation.applicationTracker",
      icon: ClipboardList,
      sidebar: true,
    },
    children: [
      { index: true, element: <ApplicationPage /> },
      { path: ":applicationId", element: <ApplicationDetail /> },
    ],
  },
];

export const adminDashboardRoutes = [
  {
    index: true,
    element: <AdminOverview />,
    handle: {
      label: "Dashboard",
      labelKey: "navigation.dashboard",
      icon: LayoutDashboard,
      sidebar: true,
    },
  },
  {
    path: "job-management",
    handle: {
      label: "Job Management",
      labelKey: "navigation.jobManagement",
      icon: BriefcaseBusiness,
      sidebar: true,
    },
    children: [
      { index: true, element: <JobManagement /> },
      { path: "edit/:jobId", element: <EditJobs /> },
      { path: ":jobId", element: <JobDetailsPage /> },
    ],
  },
  {
    path: "company-management",
    handle: {
      label: "Company Management",
      labelKey: "navigation.companymanagement",
      icon: Building,
      sidebar: true,
    },
    children: [
      { index: true, element: <CompaniesPage /> },
      { path: ":id", element: <CompanyDetails /> },
    ],
  },
  {
    path: "user-management",
    handle: {
      label: "User Management",
      labelKey: "navigation.usermanagement",
      icon: Users,
      sidebar: true,
    },
    children: [
      { index: true, element: <UserManagementPage /> },
      { path: ":id", element: <UsersDetailsPage /> },
    ],
  },
  {
    path: "audit-logs",
    handle: {
      label: "Audit Logs",
      labelKey: "navigation.auditLogs",
      icon: List,
      sidebar: true,
    },
    children: [
      { index: true, element: <AuditLogsList /> },
      { path: ":auditId", element: <AuditLogDetails /> },
    ],
  },
  {
    path: "cms",
    element: <CmsHomePage />,
    handle: {
      label: "CMS",
      labelKey: "navigation.cms",
      icon: Users,
      sidebar: true,
    },
  },
  {
    path: "dashboard-auth",
    element: <AuthSettingsPage />,
    handle: {
      label: "Auth CMS",
      labelKey: "navigation.authCms",
      icon: ShieldCheck,
      sidebar: true,
    },
  },
];

// Kept as a named export so any legacy import of `dashboard` keeps resolving;
// the role-aware tree is selected by <DashboardRoleTree />.
export const dashboard = adminDashboardRoutes;
