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
    ...options,
  });
}

/** Single company with its profile, jobs, activity and counters. */
export function useAdminCompanyQuery(companyId, options = {}) {
  return useAdminQuery({
    queryKey: adminKeys.company(companyId),
    queryFn: () => fetchAdminCompanyRequest(companyId),
    enabled: Boolean(companyId),
    ...options,
  });
}

/** POST /api/admin/companies */
export function useCreateAdminCompanyMutation() {
  return useAdminMutation({
    mutationFn: createAdminCompanyRequest,
    invalidates: [adminInvalidation.companies, adminInvalidation.dashboard],
  });
}

/**
 * PATCH /api/admin/companies/{id}
 * Also backs Verify and Reject: the verification card sets a status, which is
 * a partial update on the same record.
 */
export function useUpdateAdminCompanyMutation(companyId) {
  return useAdminMutation({
    mutationFn: (payload) => updateAdminCompanyRequest({ id: companyId, ...payload }),
    invalidates: [adminInvalidation.companies, adminInvalidation.dashboard],
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
    invalidates: [adminInvalidation.companies, adminInvalidation.dashboard],
  });
}