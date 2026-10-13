// src/features/candidate/hooks/useVerifyCvExtractionMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyCvExtractionRequest } from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { useApiMutation } from "@/features/auth/hooks/useApiMutation";

/**
 * Verify CV Extraction mutation.
 * Merges confirmed skills/experiences into the candidate profile.
 * Body: { skills: [...], experiences: [...] }
 * On success: invalidates profile, history, and status queries.
 * The extraction should get a "verified" status (observed from backend behavior).
 */
export const useVerifyCvExtractionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ extractionId, payload }) =>
      verifyCvExtractionRequest(extractionId, payload),
    onSuccess: (data, variables, context) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: candidateKeys.profile() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.history() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.status(variables.extractionId) });
      // Note: we don't have the cvDocumentId directly, but history invalidation covers it
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Keep all edits in place for retry
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};