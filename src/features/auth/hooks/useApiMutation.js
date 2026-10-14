import { useMutation } from "@tanstack/react-query";
import { normalizeApiError } from "@/lib/normalizeApiError";

/**
 * Thin wrapper around useMutation. Adds nothing except one shared job:
 * normalize every backend error response into { status, message, fieldErrors }
 * so every feature hook (auth, admin, candidate...) gets the same error shape
 * for free instead of parsing error.response.data.errors itself.
 *
 * No redirect / toast logic here on purpose — each feature hook decides what
 * "success" or "failure" means for its own flow.
 */
export const useApiMutation = ({ mutationFn, ...options }) => {
  return useMutation({
    // Normalizing inside mutationFn (not inside onError) means the thrown value
    // becomes mutation.error itself, so components and onError callbacks both
    // see { status, message, fieldErrors } instead of the raw AxiosError.
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    ...options,
  });
};

// Re-exported so existing `from "@/features/auth/hooks/useApiMutation"` imports
// keep working while the implementation lives in lib/ (shared by every domain).
export { normalizeApiError };