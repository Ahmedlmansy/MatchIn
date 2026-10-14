// src/features/candidate/hooks/useRetryCvMutation.js
import { useQueryClient } from "@tanstack/react-query";
import { retryCvRequest } from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { useApiMutation } from "@/features/auth/hooks/useApiMutation";

/**
 * Retry CV extraction mutation.
 * For a previously failed CV document.
 * On success: invalidates history and status, returns new document data for polling.
 */
export const useRetryCvMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: retryCvRequest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.history() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.status(variables) });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};