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
import { isCandidateRole } from "@/features/auth/store/auth.roles";

/**
 * Candidate profile query.
 *
 * Server state, so it belongs in TanStack Query and not Redux (convention §1):
 * components read isPending / isError / data straight off this hook instead of
 * keeping their own loading booleans. The response is normalized in the API
 * module, so `data` is already the domain shape the onboarding form expects.
 *
 * ── Role gate ────────────────────────────────────────────────────────────
 * GET /api/candidate/profile is candidate-gated. A staff account calling it
 * gets a 401/403, which the axios interceptor converts into a refresh and then
 * clearCredentials() — i.e. logging an admin out of their own session. That is
 * why this hook refuses to run for anyone who is not a candidate.
 *
 * The gate is applied HERE, inside the hook, rather than left to each call site:
 * the endpoint and the rule that guards it belong together, so a new caller
 * cannot reintroduce the bug by forgetting `enabled`.
 *
 * It is also applied LAST — a caller-supplied `enabled` is ANDed with it rather
 * than spread over it. Previously `...options` came after `enabled`, so any
 * caller passing `enabled: true` silently unlocked the request for every role.
 */
export const useProfileQuery = (options = {}) => {
  const { enabled: callerEnabled = true, ...rest } = options;
  const role = useSelector(selectUserRole);
  const isCandidate = isCandidateRole(role);

  return useQuery({
    queryKey: candidateKeys.profile(),
    // Both conditions must hold. Defaults to true when no caller option is
    // given, so a plain `useProfileQuery()` behaves as before.
    enabled: isCandidate && callerEnabled,
    queryFn: async () => {
      try {
        return normalizeCandidateProfile(await fetchCandidateProfileRequest());
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...rest,
  });
};