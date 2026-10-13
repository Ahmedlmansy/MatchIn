// src/features/candidate/hooks/useProfileQuery.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchCandidateProfileRequest,
  normalizeCandidateProfile,
} from "@/features/candidate/api/candidate.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";

/**
 * Candidate profile query.
 *
 * Server state, so it belongs in TanStack Query and not Redux (convention §1):
 * components read isPending / isError / data straight off this hook instead of
 * keeping their own loading booleans. The response is normalized in the API
 * module, so `data` is already the domain shape the onboarding form expects.
 *
 * No automatic refetch on window focus — the profile is a snapshot, and the
 * onboarding page can call refetch() explicitly if needed.
 *
 * @returns TanStack query result: { data, isPending, isError, error, refetch, isFetching }
 *   data = { jobTitle, jobType, workStyle, location, experience, goals }
 *   error = { status, message, fieldErrors } via normalizeApiError.
 */
export const useProfileQuery = (options = {}) => {
  return useQuery({
    queryKey: candidateKeys.profile(),
    queryFn: async () => {
      try {
        return normalizeCandidateProfile(await fetchCandidateProfileRequest());
      } catch (error) {
        // Normalizing here means the query's own `error` is already the
        // { status, message, fieldErrors } shape the ErrorState and any
        // retry logic expects.
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};