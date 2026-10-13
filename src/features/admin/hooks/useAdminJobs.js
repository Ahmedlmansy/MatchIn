// src/features/admin/hooks/useAdminJobs.js
//
// Every job-management read and write in one file:
// the list query, the detail query, and the three mutations (create, update
// content, change status).
//
// Pages import from here and never call the API module directly, so the
// query key, the invalidation targets and the loading/error contract live in
// exactly one place per resource.

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
    ...options,
  });
}

/** Single job. Disabled until the route actually supplies an id. */
export function useAdminJobQuery(jobId, options = {}) {
  return useAdminQuery({
    queryKey: adminKeys.job(jobId),
    queryFn: () => fetchAdminJobRequest(jobId),
    enabled: Boolean(jobId),
    ...options,
  });
}

/**
 * POST /api/admin/jobs — create.
 * Invalidates the list and the overview counters.
 */
export function useCreateAdminJobMutation() {
  return useAdminMutation({
    mutationFn: createAdminJobRequest,
    invalidates: [adminInvalidation.jobs, adminInvalidation.dashboard],
  });
}

/**
 * PATCH /api/admin/jobs/{id} — edit content or change status.
 * One mutation serves both because they are the same endpoint; `status` is
 * just one of the patchable fields. Invalidates the list, the detail record
 * and the overview counters.
 */
export function useUpdateAdminJobMutation(jobId) {
  return useAdminMutation({
    mutationFn: (payload) => updateAdminJobRequest({ id: jobId, ...payload }),
    // The whole jobs resource: every filtered/paged list variant, the detail
    // record, and the overview counters that read from it.
    invalidates: [adminInvalidation.jobs, adminInvalidation.dashboard],
  });
}