import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminDashboardRequest,
  normalizeAdminDashboard,
} from "@/features/admin/api/admin.api";
import { adminKeys } from "@/features/admin/constants/admin.query-keys";
// Same app-wide error normalizer the mutation hooks use, so a failed dashboard
// load surfaces as { status, message, fieldErrors } like every other screen.
// TODO: this still lives under features/auth — it belongs in a shared module.
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";

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
 * @returns TanStack query result: { data, isPending, isError, error, refetch, isFetching }
 *   data = { stats, recentActivity, auditLogs }
 *   error = { status, message, fieldErrors } via normalizeApiError.
 */
export const useAdminDashboardQuery = (options = {}) => {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async () => {
      try {
        return normalizeAdminDashboard(await fetchAdminDashboardRequest());
      } catch (error) {
        // Normalizing here (not in a throwaway catch downstream) means the
        // query's own `error` is already the { status, message, fieldErrors }
        // shape the ErrorState and any retry logic expects.
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};