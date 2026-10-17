// src/features/admin/constants/adminDashboardActions.js
//
// The overview page's Quick Actions strip.
//
// These are navigation targets, not data — which is why they no longer live in
// the deleted adminDashboardData.js mock module. `href` is a dashboard route
// path without the language segment; the page localizes it at render time so
// these stay readable here.
//
// `title` / `description` were plain English strings until Phase 3. They are
// resolved from `pages.admin.overview.quickActions.<id>` in AdminOverview now,
// so an id whose copy is missing is a visible blank card rather than a silent
// English fallback.

import { Building2, CheckCircle2, Briefcase, FileCheck } from "lucide-react";

export const QUICK_ACTIONS = [
  {
    id: "manage-companies",
    icon: Building2,
    iconClass: "bg-primary/10 text-primary",
    href: "/dashboard/company-management",
  },
  {
    id: "review-pending",
    icon: CheckCircle2,
    iconClass: "bg-secondary/12 text-secondary",
    href: "/dashboard/company-management?status=pending",
  },
  {
    id: "manage-jobs",
    icon: Briefcase,
    iconClass: "bg-warning/14 text-warning",
    href: "/dashboard/job-management",
  },
  {
    id: "audit-logs",
    icon: FileCheck,
    iconClass: "bg-success/12 text-success",
    href: "/dashboard/audit-logs",
  },
];