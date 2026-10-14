// src/features/admin/hooks/useAdminAuditLogs.js
//
// Audit logs are an immutable, read-only record, so this module exposes reads
// and deliberately no mutations.

import { useAdminQuery, toQueryParams } from "./useAdminQuery";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/lib/normalizeApiError";
import {
  logQueryStart,
  logQuerySuccess,
  logQueryError,
} from "./adminDevLog";
import { adminKeys } from "@/features/admin/constants/admin.query-keys";
import {
  fetchAdminAuditLogsRequest,
  normalizeAuditLogDetail,
} from "@/features/admin/api/admin-audit-logs.api";

/** How far the id lookup walks when a deep link misses every cached page. */
const MAX_ID_LOOKUP_PAGES = 20;
const ID_LOOKUP_PAGE_SIZE = 50;

/**
 * Audit log list. Server-side search/filter/sort/pagination.
 * @returns { data: { items, total, page, pageCount }, isPending, isError, error, refetch }
 */
export function useAdminAuditLogsQuery(filters, options = {}) {
  const params = toQueryParams(filters);

  return useAdminQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => fetchAdminAuditLogsRequest(params),
    name: "auditLogs.list",
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

  // Not routed through useAdminQuery: this reads the react-query cache
  // synchronously rather than the API. It logs the same way so the audit-log
  // detail screen is visible alongside every other admin screen.
  logQueryStart("auditLogs.detail", { params: { auditId }, enabled: Boolean(auditId) });

  return useQuery({
    queryKey: [...adminKeys.auditLogsRoot(), "detail", String(auditId)],
    enabled: Boolean(auditId),
    queryFn: async () => {
      const startedAt = performance.now();
      const cached = queryClient
        .getQueriesData({ queryKey: adminKeys.auditLogsRoot() })
        .flatMap(([, data]) => data?.items ?? [])
        .find((log) => String(log.id) === String(auditId));

      if (cached) {
        logQuerySuccess("auditLogs.detail", {
          ms: Math.round(performance.now() - startedAt),
          summary: `from cache (${cached.id})`,
        });
        return normalizeAuditLogDetail(cached);
      }

      try {
        // Fallback for a deep link to a log that is in no cached page. The
        // backend's `search` covers the actor/action/entity text columns, not
        // the id, so asking it for an id matches nothing and every bookmarked
        // audit-log URL resolved to "not found". Paging in and matching the id
        // locally is what actually finds the record.
        let match = null;
        for (let page = 1; !match && page <= MAX_ID_LOOKUP_PAGES; page += 1) {
          const { items, pageCount } = await fetchAdminAuditLogsRequest({
            page,
            per_page: ID_LOOKUP_PAGE_SIZE,
          });
          match = items.find((log) => String(log.id) === String(auditId)) ?? null;
          if (page >= pageCount) break;
        }

        if (!match) {
          // A plain Error with `status` so the page can distinguish "not found"
          // from a genuine server failure.
          const notFound = Object.assign(new Error("Audit log not found"), { status: 404 });
          logQueryError("auditLogs.detail", {
            ms: Math.round(performance.now() - startedAt),
            status: 404,
            message: notFound.message,
          });
          throw notFound;
        }

        logQuerySuccess("auditLogs.detail", {
          ms: Math.round(performance.now() - startedAt),
          summary: "from network",
        });
        return normalizeAuditLogDetail(match);
      } catch (error) {
        // Normalized like every other admin read. Without this the page showed
        // raw axios copy ("Request failed with status code 500") and its
        // `error?.status === 404` check could never match a real HTTP status,
        // because only the synthesized not-found error below carried one.
        const normalized = normalizeApiError(error);
        logQueryError("auditLogs.detail", {
          ms: Math.round(performance.now() - startedAt),
          status: normalized.status,
          message: normalized.message,
        });
        throw normalized;
      }
    },
    ...options,
  });
}

/** Detail shape for a row the page already has in memory (used by the drawer). */
export function useAuditLogDetail(log) {
  return log ? normalizeAuditLogDetail(log.raw) : null;
}