import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/features/auth/hooks/useApiMutation";
import { updateCareerPreferencesRequest } from "@/features/candidate/api/candidate.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";

export const useUpdateCareerPreferencesMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: async (payload) => updateCareerPreferencesRequest(payload),
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData(candidateKeys.profile(), (current) => ({
        ...(current ?? {}),
        ...(data ?? {}),
      }));
      await queryClient.invalidateQueries({ queryKey: candidateKeys.profile() });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
};
