// src/features/candidate/hooks/useJobMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  saveJobRequest,
  unsaveJobRequest,
  applyToJobRequest,
} from "@/features/candidate/api/jobs.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * Save/unsave job mutation.
 * Optimistically updates the saved jobs list and job details.
 */
export const useSaveJobMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async ({ jobId, saved }) => {
      if (saved) {
        await unsaveJobRequest(jobId);
        return { jobId, saved: false };
      } else {
        await saveJobRequest(jobId);
        return { jobId, saved: true };
      }
    },
    onMutate: async ({ jobId, saved }) => {
      if (role !== "candidate") return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: candidateKeys.jobs.saved() });
      await queryClient.cancelQueries({ queryKey: candidateKeys.jobs.list() });
      await queryClient.cancelQueries({ queryKey: candidateKeys.jobs.details(jobId) });

      // Snapshot previous values
      const previousSavedJobs = queryClient.getQueryData(candidateKeys.jobs.saved());
      const previousJobDetails = queryClient.getQueryData(candidateKeys.jobs.details(jobId));

      // Optimistically update saved jobs list
      queryClient.setQueriesData(
        { queryKey: candidateKeys.jobs.saved(), exact: false },
        (old) => {
          if (!old) return old;
          const newSaved = saved ? false : true;
          if (newSaved) {
            // We don't have full job data here, so just mark for refetch
            return old;
          } else {
            return {
              ...old,
              jobs: old.jobs.filter((job) => job.id !== jobId),
              meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
            };
          }
        }
      );

      // Optimistically update job details
      queryClient.setQueryData(candidateKeys.jobs.details(jobId), (old) => {
        if (!old) return old;
        return { ...old, isBookmarked: !saved };
      });

      return { previousSavedJobs, previousJobDetails };
    },
    onError: (error, variables, context) => {
      if (context?.previousSavedJobs) {
        queryClient.setQueryData(candidateKeys.jobs.saved(), context.previousSavedJobs);
      }
      if (context?.previousJobDetails) {
        queryClient.setQueryData(candidateKeys.jobs.details(variables.jobId), context.previousJobDetails);
      }
      // Error will be handled by onError in component
    },
    onSettled: (data, error, variables) => {
      // Invalidate to refetch correct state
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.saved(), exact: false });
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.list(), exact: false });
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.details(variables.jobId) });
    },
    ...options,
  });
};

/**
 * Apply to job mutation.
 */
export const useApplyJobMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async ({ jobId, payload }) => {
      const response = await applyToJobRequest(jobId, payload);
      return response?.data ?? response;
    },
    onMutate: async ({ jobId }) => {
      if (role !== "candidate") return;

      await queryClient.cancelQueries({ queryKey: candidateKeys.jobs.details(jobId) });
      await queryClient.cancelQueries({ queryKey: candidateKeys.applications() });

      const previousJobDetails = queryClient.getQueryData(candidateKeys.jobs.details(jobId));

      // Optimistically update job details status
      queryClient.setQueryData(candidateKeys.jobs.details(jobId), (old) => {
        if (!old) return old;
        return {
          ...old,
          status: "applied",
          appliedText: "Applied just now • Application under review",
        };
      });

      return { previousJobDetails };
    },
    onError: (error, variables, context) => {
      if (context?.previousJobDetails) {
        queryClient.setQueryData(candidateKeys.jobs.details(variables.jobId), context.previousJobDetails);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.details(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.applications(), exact: false });
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.saved(), exact: false });
    },
    ...options,
  });
};

/**
 * Batch apply to multiple jobs mutation.
 */
export const useBatchApplyJobsMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobIds, payload }) => {
      const results = await Promise.allSettled(
        jobIds.map((jobId) => applyToJobRequest(jobId, payload))
      );
      return results.map((r, i) => ({
        jobId: jobIds[i],
        success: r.status === "fulfilled",
        data: r.status === "fulfilled" ? (r.value?.data ?? r.value) : null,
        error: r.status === "rejected" ? r.reason : null,
      }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.applications(), exact: false });
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.saved(), exact: false });
      queryClient.invalidateQueries({ queryKey: candidateKeys.jobs.list(), exact: false });
    },
    ...options,
  });
};