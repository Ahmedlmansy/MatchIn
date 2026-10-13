// src/features/admin/hooks/useAdminCompanies.js
//
// Company-management reads and writes: the list query, the detail query, and
// the mutations behind Verify / Reject / Edit / Create / Merge.

import { useAdminQuery, useAdminMutation, toQueryParams } from "./useAdminQuery";
import { adminKeys, adminInvalidation } from "@/features/admin/constants/admin.query-keys";
import {
  fetchAdminCompaniesRequest,
  fetchAdminCompanyRequest,
  createAdminCompanyRequest,
  updateAdminCompanyRequest,
  mergeAdminCompaniesRequest,
} from "@/features/admin/api/admin-companies.api";

/**
 * Company list. Server-side search/filter/sort/pagination.
 * @returns { data: { items, total, page, pageCount }, isPending, isError, error, refetch }
 */
export function useAdminCompaniesQuery(filters, options = {}) {
  const params = toQueryParams(filters);

  return useAdminQuery({
    queryKey: adminKeys.companies(params),
    queryFn: () => fetchAdminCompaniesRequest(params),
    name: "companies.list",
    ...options,
  });
}

/** Single company with its profile, jobs, activity and counters. */
export function useAdminCompanyQuery(companyId, options = {}) {
  // enabled is re-applied last so a caller cannot bypass the id guard and
  // request /companies/undefined.
  const { enabled: callerEnabled = true, ...rest } = options;

  return useAdminQuery({
    queryKey: adminKeys.company(companyId),
    queryFn: () => fetchAdminCompanyRequest(companyId),
    name: "companies.detail",
    params: { companyId },
    enabled: Boolean(companyId) && callerEnabled,
    ...rest,
  });
}

/** POST /api/admin/companies */
export function useCreateAdminCompanyMutation() {
  return useAdminMutation({
    mutationFn: createAdminCompanyRequest,
    name: "companies.create",
    invalidates: [adminInvalidation.companies, adminInvalidation.dashboard, adminInvalidation.auditLogs],
  });
}

/**
 * PATCH /api/admin/companies/{id}
 * Also backs Verify and Reject: the verification card sets a status, which is
 * a partial update on the same record.
 *
 * As with jobs, the id is resolved from the payload first and the hook argument
 * second, and a missing id fails locally rather than issuing
 * `PATCH /api/admin/companies/undefined`.
 */
export function useUpdateAdminCompanyMutation(companyId) {
  return useAdminMutation({
    mutationFn: ({ id, ...payload } = {}) => {
      const targetId = id ?? companyId;
      if (!targetId) throw new Error("Cannot update a company without an id.");
      return updateAdminCompanyRequest({ id: targetId, ...payload });
    },
    name: "companies.update",
    invalidates: [adminInvalidation.companies, adminInvalidation.dashboard, adminInvalidation.auditLogs],
  });
}

/**
 * POST /api/admin/companies/{id}/merge
 * A merge deletes the source company, so it invalidates both the list and the
 * detail record — the detail page will 404 afterwards if it stays open, which
 * the page handles by navigating back to the list.
 */
export function useMergeAdminCompaniesMutation() {
  return useAdminMutation({
    mutationFn: mergeAdminCompaniesRequest,
    name: "companies.merge",
    invalidates: [adminInvalidation.companies, adminInvalidation.dashboard, adminInvalidation.auditLogs],
  });
}