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
//
// Both factories are also the single logging point for the admin data layer —
// see adminDevLog.js for how to silence it.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { normalizeApiError } from "@/lib/normalizeApiError";
import { pruneParams } from "@/features/admin/api/normalize";
import {
  nameFromQueryKey,
  logQueryStart,
  logQuerySuccess,
  logQueryError,
  logMutationStart,
  logMutationSuccess,
  logMutationError,
  logInvalidation,
} from "./adminDevLog";

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
 *
 * Debug: `name` overrides the name derived from the query key; otherwise the
 * key itself identifies the call, e.g. `admin.jobs.list` vs `admin.users.list`.
 */
export function useAdminQuery({
  queryKey,
  queryFn,
  enabled = true,
  name,
  params,
  ...options
}) {
  const label = name ?? nameFromQueryKey(queryKey);

  return useQuery({
    queryKey,
    // Lets a detail page hold the request until the route supplies an id.
    enabled,
    queryFn: async () => {
      // Logged here rather than in the hook body: a hook body runs on every
      // render of every screen using it — and twice per render under
      // <StrictMode> — so the "▶ query start" line fired continuously and
      // scrolled the genuinely useful start/success/error lines off the
      // console.
      logQueryStart(label, { params, enabled });
      const startedAt = performance.now();
      try {
        const result = await queryFn();
        logQuerySuccess(label, {
          ms: Math.round(performance.now() - startedAt),
          summary: summarize(result),
        });
        return result;
      } catch (error) {
        const normalized = normalizeApiError(error);
        logQueryError(label, {
          ms: Math.round(performance.now() - startedAt),
          status: normalized.status,
          message: normalized.message,
        });
        // Throwing the normalized error means the query's own `error` is
        // already the { status, message, fieldErrors } shape.
        throw normalized;
      }
    },
    retry: 1,
    ...options,
  });
}

/** One-line description of a paginated list result, for the console. */
function summarize(result) {
  if (Array.isArray(result?.items)) {
    return `${result.items.length} of ${result.total} item(s), page ${result.page}/${result.pageCount}`;
  }
  return null;
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
 * @param name label used in the debug output; defaults to the function name.
 * @param onSuccess optional caller callback — invoked *after* the invalidation
 *                  resolves. It is destructured out rather than left in
 *                  `options`, because a `...options` spread placed after
 *                  `onSuccess` would silently replace it and skip the cache
 *                  refresh entirely — the exact bug this wrapper exists to
 *                  make impossible.
 */
export function useAdminMutation({
  mutationFn,
  invalidates = [],
  onSuccess,
  name,
  ...options
}) {
  const queryClient = useQueryClient();
  const label = name ?? mutationFn?.name ?? "admin.mutation";

  return useMutation({
    mutationFn: async (variables) => {
      logMutationStart(label, variables);
      const startedAt = performance.now();
      try {
        return await mutationFn(variables);
      } catch (error) {
        const normalized = normalizeApiError(error);
        logMutationError(label, {
          ms: Math.round(performance.now() - startedAt),
          status: normalized.status,
          message: normalized.message,
        });
        throw normalized;
      }
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate before reporting success, so the console shows the cache
      // refresh that the UI is about to depend on.
      //
      // refetchType: "all", not the default "active". The app sets
      // refetchOnMount: false globally, and "active" only refetches queries
      // that are on screen right now — every cached-but-unmounted list was
      // merely marked stale and then never refetched, because mounting a stale
      // query does not refetch it under that setting. The practical effect was
      // invisible per-page and everywhere at once: verify a company on its
      // detail screen, hit "Back to Companies", and the row still read
      // "pending". Invalidating with "all" makes the write actually land in
      // every cached variant of that resource.
      const keys = invalidates.map((keyFactory) => JSON.stringify(keyFactory()));
      await Promise.all(
        invalidates.map((keyFactory) =>
          queryClient.invalidateQueries({
            queryKey: keyFactory(),
            refetchType: "all",
          }),
        ),
      );
      logInvalidation(label, keys);
      logMutationSuccess(label);
      onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Turns a filter state object into the query params the backend expects.
 *
 * Used by every list page so `search`/`status`/`sort`/`page` are built the same
 * way, and so a reset filter never reaches the wire.
 *
 * pruneParams is applied here, not only in the query-key factory. The keys
 * already pruned, but these params are also handed straight to axios — so
 * `status: "all"`, `role: "all"` and `search: ""` were going out as real query
 * strings (`?search=&role=all&status=all`). That contradicts what pruneParams
 * documents, and against any backend `in:` validation rule on those columns it
 * is the whole request failing with a 422 rather than one odd filter.
 */
export const toQueryParams = (filters = {}) => {
  const { page, perPage, ...rest } = filters;
  return pruneParams({
    ...rest,
    ...(page && page > 1 ? { page } : {}),
    ...(perPage ? { per_page: perPage } : {}),
  });
};