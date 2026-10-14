// src/features/admin/constants/companyVerification.js
//
// Visual configuration for company verification.
//
// This used to live in shared/companiesDetailsData.js alongside a hard-coded
// COMPANY record, which made a config map look like mock data. It is pure
// presentation config, so it belongs with the other admin constants.
//
// The three states here mirror the three states
// normalizeCompanyStatus() collapses the backend's spelling into.

import { Clock, CheckCircle2, XCircle } from "lucide-react";

export const VERIFICATION_STATUS = {
  pending: { icon: Clock, tone: "warning", labelKey: "status.pending", bannerKey: "banner.pending" },
  verified: { icon: CheckCircle2, tone: "success", labelKey: "status.verified", bannerKey: "banner.verified" },
  rejected: { icon: XCircle, tone: "error", labelKey: "status.rejected", bannerKey: "banner.rejected" },
};

export const DEFAULT_VERIFICATION_STATUS = "pending";

/** Per-tone Tailwind classes shared by the banner, badge and controls. */
export const VERIFICATION_TONES = {
  warning: {
    banner: "border-warning/30 bg-warning/10",
    icon: "bg-warning/15 text-warning",
    title: "text-warning",
    badge: "bg-warning/12 text-warning",
    dot: "bg-warning",
    control: "border-warning/40 text-warning hover:bg-warning/10",
  },
  success: {
    banner: "border-success/25 bg-success/10",
    icon: "bg-success/20 text-success",
    title: "text-success",
    badge: "bg-success/12 text-success",
    dot: "bg-success",
    control: "border-success/40 text-success hover:bg-success/10",
  },
  error: {
    banner: "border-error/25 bg-error/10",
    icon: "bg-error/15 text-error",
    title: "text-error",
    badge: "bg-error/12 text-error",
    dot: "bg-error",
    control: "border-error/35 text-error hover:bg-error/10",
  },
};

/** Timeline dot colors for the company activity feed. */
export const ACTIVITY_DOTS = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  muted: "bg-muted",
};