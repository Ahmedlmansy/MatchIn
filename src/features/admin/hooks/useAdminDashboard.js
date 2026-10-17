// src/features/admin/hooks/useAdminDashboard.js
//
// The admin overview read. Wrapped in the shared useAdminQuery so the error
// contract matches every other admin screen.

import { useTranslation } from "react-i18next";
import { useAdminQuery } from "./useAdminQuery";
import { adminKeys } from "@/features/admin/constants/admin.query-keys";
import {
  fetchAdminDashboardRequest,
  normalizeAdminDashboard,
} from "@/features/admin/api/admin.api";

/**
 * Admin dashboard overview data.
 *
 * Server state, so it belongs in TanStack Query and not Redux (convention §1):
 * components read isPending / isError / data straight off this hook instead of
 * keeping their own loading booleans. The response is normalized in the API
 * module, so `data` is already the domain shape the view model expects.
 *
 * No automatic refetch on window focus — the overview is a snapshot, and the
 * header's Refresh button calls refetch() explicitly.
 *
 * @returns { data: { stats, recentActivity, auditLogs }, isPending, isError, error, refetch }
 */
export const useAdminDashboardQuery = (options = {}) => {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";

  return useAdminQuery({
    queryKey: adminKeys.dashboard(locale),
    queryFn: async () =>
      normalizeAdminDashboard(await fetchAdminDashboardRequest()),
    name: "dashboard.summary",
    staleTime: 60_000,
    ...options,
  });
};
