// src/features/admin/constants/adminDashboardActions.js
//
// The overview page's Quick Actions strip.
//
// These are navigation targets, not data — which is why they no longer live in
// the deleted adminDashboardData.js mock module. `href` is a dashboard route
// path without the language segment; the page localizes it at render time so
// these stay readable here.

import { Building2, CheckCircle2, Briefcase, FileCheck } from "lucide-react";

export const QUICK_ACTIONS = [
  {
    id: "manage-companies",
    icon: Building2,
    iconClass: "bg-primary/10 text-primary",
    title: "Manage Companies",
    description: "View, edit & suspend company accounts",
    href: "/dashboard/company-management",
  },
  {
    id: "review-pending",
    icon: CheckCircle2,
    iconClass: "bg-secondary/12 text-secondary",
    title: "Review Pending",
    description: "Approve or reject new company requests",
    href: "/dashboard/company-management?status=pending",
  },
  {
    id: "manage-jobs",
    icon: Briefcase,
    iconClass: "bg-warning/14 text-warning",
    title: "Manage Jobs",
    description: "Moderate listings & featured positions",
    href: "/dashboard/job-management",
  },
  {
    id: "audit-logs",
    icon: FileCheck,
    iconClass: "bg-success/12 text-success",
    title: "View Audit Logs",
    description: "Track admin actions & system events",
    href: "/dashboard/audit-logs",
  },
];