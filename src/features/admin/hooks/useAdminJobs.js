// src/features/admin/hooks/useAdminJobs.js
//
// Every job-management read and write in one file:
// the list query, the detail query, and the two mutations (create, update).
//
// Pages import from here and never call the API module directly, so the
// query key, the invalidation targets and the loading/error contract live in
// exactly one place per resource.
//
// The `name` passed to each hook is what shows up in the debug console — see
// adminDevLog.js.

import { useAdminQuery, useAdminMutation, toQueryParams } from "./useAdminQuery";
import { adminKeys, adminInvalidation } from "@/features/admin/constants/admin.query-keys";
import {
  fetchAdminJobsRequest,
  fetchAdminJobRequest,
  createAdminJobRequest,
  updateAdminJobRequest,
} from "@/features/admin/api/admin-jobs.api";

/**
 * Admin job list. Server-side search/filter/sort/pagination.
 * @returns { data: { items, total, page, pageCount }, isPending, isError, error, refetch }
 */
export function useAdminJobsQuery(filters, options = {}) {
  const params = toQueryParams(filters);

  return useAdminQuery({
    queryKey: adminKeys.jobs(params),
    queryFn: () => fetchAdminJobsRequest(params),
    name: "jobs.list",
    params,
    ...options,
  });
}

/** Single job. Disabled until the route actually supplies an id. */
export function useAdminJobQuery(jobId, options = {}) {
  // `enabled` is pulled out of options and re-applied last, so a caller passing
  // enabled: true cannot bypass the jobId guard and request /jobs/undefined.
  const { enabled: callerEnabled = true, ...rest } = options;

  return useAdminQuery({
    queryKey: adminKeys.job(jobId),
    queryFn: () => fetchAdminJobRequest(jobId),
    name: "jobs.detail",
    params: { jobId },
    enabled: Boolean(jobId) && callerEnabled,
    ...rest,
  });
}

/**
 * POST /api/admin/jobs — create.
 * Invalidates the list and the overview counters.
 */
export function useCreateAdminJobMutation() {
  return useAdminMutation({
    mutationFn: createAdminJobRequest,
    name: "jobs.create",
    invalidates: [adminInvalidation.jobs, adminInvalidation.dashboard, adminInvalidation.auditLogs],
  });
}

/**
 * PATCH /api/admin/jobs/{id} — edit content or change status.
 * One mutation serves both because they are the same endpoint; `status` is
 * just one of the patchable fields. Invalidates the whole jobs resource (every
 * filtered/paged list variant, the detail record) and the overview counters.
 *
 * The id comes from the hook argument on the detail screen, or from the payload
 * on the list screen where there is no single record in scope. It used to be
 * `{ id: jobId, ...payload }`, which means an id-less payload spread over the
 * hook argument and produced `PATCH /api/admin/jobs/undefined` — a URL that
 * reaches the backend and 404s rather than failing where the mistake is.
 * Resolving it explicitly makes a missing id a loud local failure instead.
 */
export function useUpdateAdminJobMutation(jobId) {
  return useAdminMutation({
    mutationFn: ({ id, ...payload } = {}) => {
      const targetId = id ?? jobId;
      if (!targetId) throw new Error("Cannot update a job without an id.");
      return updateAdminJobRequest({ id: targetId, ...payload });
    },
    name: "jobs.update",
    invalidates: [adminInvalidation.jobs, adminInvalidation.dashboard, adminInvalidation.auditLogs],
  });
}