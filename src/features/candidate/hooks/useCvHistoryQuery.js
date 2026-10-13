// src/features/candidate/hooks/useCvHistoryQuery.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchCvHistoryRequest,
  normalizeCvHistory,
} from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";

/**
 * CV History query.
 * Returns list of CV documents ordered by version desc (newest first).
 * @returns TanStack query result: { data, isPending, isError, error, refetch, isFetching }
 *   data = [{ id, original_filename, version, is_current, status }]
 *   error = { status, message, fieldErrors } via normalizeApiError.
 */
export const useCvHistoryQuery = (options = {}) => {
  return useQuery({
    queryKey: candidateKeys.cv.history(),
    queryFn: async () => {
      try {
        return normalizeCvHistory(await fetchCvHistoryRequest());
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 30_000,
    retry: 1,
    ...options,
  });
};