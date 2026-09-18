import { Compass, Send, Bookmark, Route, MessageSquare } from "lucide-react";

export const DASHBOARD_QUICK_ACTIONS = [
  { label: "Browse Jobs", to: "/jobs", icon: Compass, variant: "primary" },
  { label: "View Applications", to: "/applications", icon: Send, variant: "secondary" },
  { label: "Saved Jobs", to: "/saved-jobs", icon: Bookmark, variant: "secondary" },
  { label: "Open Roadmap", to: "/roadmap", icon: Route, variant: "secondary" },
  { label: "Ask AI Mentor", to: "/mentor", icon: MessageSquare, variant: "secondary" },
];
