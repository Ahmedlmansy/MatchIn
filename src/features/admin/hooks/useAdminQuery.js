// src/features/admin/hooks/useAdminQuery.js
//
// The two hook factories every admin screen is built from.
//
// Before this file each admin page hand-rolled its own try/catch, its own
// normalizeApiError call and its own loading/error bookkeeping — five slightly
// different copies of the same thing. A screen now reads:
//
//   const { data, isPending, isError, error, refetch } = useAdminQuery(...)
//
// and gets the identical contract everywhere.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/lib/normalizeApiError";

/**
 * Admin read hook.
 *
 * Normalizes the error inside queryFn (not in a downstream catch) so the
 * query's own `error` is already { status, message, fieldErrors } — which is
 * what ErrorState and retry logic expect.
 *
 * `enabled: false` is honoured (so a detail page can skip the request until it
 * has an id), and `refetchOnWindowFocus` stays off because every admin list
 * has an explicit Refresh button.
 */
export function useAdminQuery({ queryKey, queryFn, enabled = true, ...options }) {
  return useQuery({
    queryKey,
    // Lets a detail page hold the request until the route supplies an id.
    enabled,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    retry: 1,
    ...options,
  });
}

/**
 * Admin write hook.
 *
 * Guarantees that a failed create/update/verify invalidates nothing, and that
 * the caller only has to declare *which* cache slices a successful write
 * affects. Every admin mutation in this feature goes through here, so adding
 * a new admin action can never accidentally forget to refresh the list it
 * changed.
 *
 * @param mutationFn async (variables) => savedRecord
 * @param invalidates array of query-key factories to invalidate on success,
 *                    e.g. [adminInvalidation.companies]
 * @param onSuccess optional caller callback — invoked *after* the invalidation
 *                  resolves. It is destructured out rather than left in
 *                  `options`, because a `...options` spread placed after
 *                  `onSuccess` would silently replace it and skip the cache
 *                  refresh entirely — the exact bug this wrapper exists to
 *                  make impossible.
 */
export function useAdminMutation({ mutationFn, invalidates = [], onSuccess, ...options }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    onSuccess: async (...args) => {
      await Promise.all(
        invalidates.map((keyFactory) => queryClient.invalidateQueries({ queryKey: keyFactory() })),
      );
      onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Turns a filter state object into the query params the backend expects.
 *
 * Used by every list page so `search`/`status`/`sort`/`page` are built the same
 * way, and so a reset filter never reaches the wire.
 */
export const toQueryParams = (filters = {}) => {
  const { page, perPage, ...rest } = filters;
  return {
    ...rest,
    ...(page && page > 1 ? { page } : {}),
    ...(perPage ? { per_page: perPage } : {}),
  };
};