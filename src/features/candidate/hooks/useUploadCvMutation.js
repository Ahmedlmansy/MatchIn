// src/features/candidate/hooks/useUploadCvMutation.js
import { useQueryClient } from "@tanstack/react-query";
import { uploadCvRequest } from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { useApiMutation } from "@/features/auth/hooks/useApiMutation";

const MAX_FILE_SIZE = 5_242_880; // 5 MB

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const getUploadErrorMessage = (error, t) => {
  if (!error) return "";
  if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
    return null;
  }
  const status = error?.status ?? error?.response?.status;
  if (status === 413) {
    return t("pages.cvManagement.fileTooLarge", "File is too large. Maximum allowed size is 5 MB.");
  }
  if (status === 422) {
    return error.message || t("pages.cvManagement.invalidFile", "Invalid file format. Only PDF and DOCX files are supported.");
  }
  if (status === 429) {
    return t("pages.cvManagement.tooManyRequests", "Too many requests. Please wait a moment before trying again.");
  }
  if (status === undefined || status === null || status >= 500 || error?.code === "ERR_NETWORK") {
    return t("pages.cvManagement.networkError", "Network connection failed. Please check your internet connection and try again.");
  }
  return error.message || t("pages.cvManagement.uploadFailed", "Failed to upload CV. Please try again.");
};

/**
 * Upload CV mutation.
 * - 120s timeout (per-request config in api layer)
 * - Supports abort via AbortController
 * - Validates file before uploading (pdf/docx, >0 bytes, <= 5MB)
 * - On success: invalidates history and returns the new document envelope for status polling
 */
export const useUploadCvMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useApiMutation({
    mutationFn: async ({ file, signal, onUploadProgress }) => {
      if (!file) {
        throw {
          status: 422,
          message: "Please select a file to upload.",
          fieldErrors: { cv: ["File is required"] },
        };
      }

      const isValidType =
        ACCEPTED_TYPES.includes(file.type) ||
        /\.(pdf|doc|docx)$/i.test(file.name || "");

      if (!isValidType) {
        throw {
          status: 422,
          message: "Invalid file format. Only PDF and DOCX files are supported.",
          fieldErrors: { cv: ["Invalid file type"] },
        };
      }

      if (file.size === 0) {
        throw {
          status: 422,
          message: "Selected file is empty.",
          fieldErrors: { cv: ["File is empty"] },
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        throw {
          status: 413,
          message: "File is too large. Maximum allowed size is 5 MB.",
          fieldErrors: { cv: ["File too large"] },
        };
      }

      return uploadCvRequest(file, { signal, onUploadProgress });
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.cv.history() });
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // If error is cancellation, don't trigger error callback
      if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
        return;
      }
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};