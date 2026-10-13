// src/features/admin/hooks/useAdminAuditLogs.js
//
// Audit logs are an immutable, read-only record, so this module exposes reads
// and deliberately no mutations.

import { useAdminQuery, toQueryParams } from "./useAdminQuery";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/features/admin/constants/admin.query-keys";
import {
  fetchAdminAuditLogsRequest,
  normalizeAuditLogDetail,
} from "@/features/admin/api/admin-audit-logs.api";

/**
 * Audit log list. Server-side search/filter/sort/pagination.
 * @returns { data: { items, total, page, pageCount }, isPending, isError, error, refetch }
 */
export function useAdminAuditLogsQuery(filters, options = {}) {
  const params = toQueryParams(filters);

  return useAdminQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => fetchAdminAuditLogsRequest(params),
    ...options,
  });
}

/**
 * A single audit log, by id.
 *
 * The backend exposes only the list endpoint (GET /api/admin/audit-logs) — no
 * /{id} route is documented — so this resolves the record out of the pages the
 * list has already fetched and cached. That keeps the detail screen consistent
 * with the row the user clicked and costs no extra request.
 *
 * If the log is not in any cached page (e.g. a bookmarked deep link), the
 * query falls back to a targeted list request filtered by that id.
 */
export function useAdminAuditLogQuery(auditId, options = {}) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...adminKeys.auditLogsRoot(), "detail", String(auditId)],
    enabled: Boolean(auditId),
    queryFn: async () => {
      const cached = queryClient
        .getQueriesData({ queryKey: adminKeys.auditLogsRoot() })
        .flatMap(([, data]) => data?.items ?? [])
        .find((log) => String(log.id) === String(auditId));

      if (cached) return normalizeAuditLogDetail(cached);

      const { items } = await fetchAdminAuditLogsRequest({ search: auditId, per_page: 1 });
      const match = items.find((log) => String(log.id) === String(auditId));

      if (!match) {
        // A plain Error with `status` so the page can distinguish "not found"
        // from a genuine server failure.
        throw Object.assign(new Error("Audit log not found"), { status: 404 });
      }

      return normalizeAuditLogDetail(match);
    },
    ...options,
  });
}

/** Detail shape for a row the page already has in memory (used by the drawer). */
export function useAuditLogDetail(log) {
  return log ? normalizeAuditLogDetail(log.raw) : null;
}