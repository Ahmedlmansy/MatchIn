// src/features/candidate/hooks/useUploadCvMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCvRequest } from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { useApiMutation } from "@/features/auth/hooks/useApiMutation";

/**
 * Upload CV mutation.
 * - 120s timeout (per-request config in api layer)
 * - Supports abort via AbortController
 * - On success: invalidates history and returns the new document ID for status polling
 * @returns useMutation result with mutate(file, { onUploadProgress, signal })
 */
export const useUploadCvMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: async ({ file, signal, onUploadProgress }) => {
      // Client-side validation before sending
      const acceptedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 5120 * 1024; // 5120 KB = 5,242,880 bytes

      if (!acceptedTypes.includes(file.type)) {
        throw {
          status: 422,
          message: "Invalid file type. Only PDF and DOCX are allowed.",
          fieldErrors: { cv: ["Invalid file type"] },
        };
      }
      if (file.size === 0) {
        throw {
          status: 422,
          message: "File is empty.",
          fieldErrors: { cv: ["File is empty"] },
        };
      }
      if (file.size > maxSize) {
        throw {
          status: 413,
          message: "File too large. Maximum size is 5 MB.",
          fieldErrors: { cv: ["File too large"] },
        };
      }

      return uploadCvRequest(file, { signal, onUploadProgress });
    },
    onSuccess: (data, variables, context) => {
      // Invalidate history to show new document
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.history() });
      // Call user's onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Keep the file selected for retry (handled by component)
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};