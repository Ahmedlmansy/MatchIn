import { Compass, Send, Bookmark, Route, MessageSquare } from "lucide-react";

export const DASHBOARD_QUICK_ACTIONS = [
  { label: "Browse Jobs", to: "/dashboard/jobs", icon: Compass, variant: "primary" },
  {
    label: "View Applications",
    to: "/dashboard/applications",
    icon: Send,
    variant: "secondary",
  },
  {
    label: "Saved Jobs",
    to: "/dashboard/saved-jobs",
    icon: Bookmark,
    variant: "secondary",
  },
  {
    label: "Open Roadmap",
    to: "/dashboard/roadmap",
    icon: Route,
    variant: "secondary",
  },
  {
    label: "Ask AI Mentor",
    to: "/dashboard/ai-chat",
    icon: MessageSquare,
    variant: "secondary",
  },
];
