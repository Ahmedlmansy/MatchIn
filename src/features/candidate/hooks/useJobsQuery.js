// src/features/candidate/hooks/useJobsQuery.js
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
// useJobDetailsQuery and useSavedJobsQuery below call four more of these.
// They were missing here and only re-exported from the bottom of this file —
// which creates no local binding — so both queries threw a ReferenceError the
// moment they ran. The re-export below serves outside consumers and does not
// bring anything into this module's scope.
import {
  fetchJobsRequest,
  fetchJobDetailsRequest,
  fetchSavedJobsRequest,
  normalizeJobsResponse,
  normalizeJobDetails,
  normalizeSavedJobsResponse,
} from "@/features/candidate/api/jobs.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * Jobs list query with filters, pagination, and sorting.
 *
 * @param {Object} filters - Filter parameters
 * @param {string} filters.search - Search query
 * @param {string} filters.location - Location filter
 * @param {string} filters.workType - Work type filter
 * @param {string} filters.experienceLevel - Experience level filter
 * @param {string} filters.sortBy - Sort field
 * @param {number} filters.page - Page number (1-based)
 * @param {number} filters.limit - Items per page
 * @param {Object} options - Additional useQuery options
 */
export const useJobsQuery = (filters = {}, options = {}) => {
  const role = useSelector(selectUserRole);

  const queryKey = candidateKeys.jobs.list(filters);

  return useQuery({
    queryKey,
    enabled: role === "candidate",
    queryFn: async () => {
      try {
        const response = await fetchJobsRequest(filters);
        return normalizeJobsResponse(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 30_000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Single job details query.
 *
 * @param {string} jobId - Job ID
 * @param {Object} options - Additional useQuery options
 */
export const useJobDetailsQuery = (jobId, options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.jobs.details(jobId),
    enabled: role === "candidate" && !!jobId,
    queryFn: async () => {
      try {
        const response = await fetchJobDetailsRequest(jobId);
        return normalizeJobDetails(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};

/**
 * Saved jobs list query.
 *
 * @param {Object} filters - Filter parameters
 * @param {string} filters.sortBy - Sort field (e.g., 'bestMatch', 'recent')
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @param {Object} options - Additional useQuery options
 */
export const useSavedJobsQuery = (filters = {}, options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.jobs.saved(filters),
    enabled: role === "candidate",
    queryFn: async () => {
      try {
        const response = await fetchSavedJobsRequest(filters);
        return normalizeSavedJobsResponse(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 30_000,
    retry: 1,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

// Re-export normalizers for use in mutations
export { normalizeJob, normalizeSavedJob, normalizeJobDetails } from "@/features/candidate/api/jobs.api";