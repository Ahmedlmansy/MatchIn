// src/features/candidate/hooks/useProfileQuery.js
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchCandidateProfileRequest,
  normalizeCandidateProfile,
} from "@/features/candidate/api/candidate.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * Candidate profile query.
 *
 * Server state, so it belongs in TanStack Query and not Redux (convention §1):
 * components read isPending / isError / data straight off this hook instead of
 * keeping their own loading booleans. The response is normalized in the API
 * module, so `data` is already the domain shape the onboarding form expects.
 */
export const useProfileQuery = (options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.profile(),
    enabled: role === "candidate",
    queryFn: async () => {
      try {
        return normalizeCandidateProfile(await fetchCandidateProfileRequest());
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};