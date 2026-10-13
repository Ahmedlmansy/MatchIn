// src/features/candidate/hooks/useVerifyCvExtractionMutation.js
import { useQueryClient } from "@tanstack/react-query";
import { verifyCvExtractionRequest } from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { useApiMutation } from "@/features/auth/hooks/useApiMutation";

/**
 * Verify CV Extraction mutation.
 * Merges confirmed skills/experiences into the candidate profile.
 * Body: { skills: [...], experiences: [...] }
 * On success: invalidates profile, history, and status queries.
 */
export const useVerifyCvExtractionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: ({ extractionId, payload }) =>
      verifyCvExtractionRequest(extractionId, payload),
    onSuccess: (data, variables, context) => {
      // Invalidate profile query, history, and status queries
      queryClient.invalidateQueries({ queryKey: candidateKeys.profile() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.history() });
      if (variables?.cvDocumentId) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.cv.status(variables.cvDocumentId) });
      } else {
        queryClient.invalidateQueries({ queryKey: candidateKeys.cv.status(variables.extractionId) });
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};