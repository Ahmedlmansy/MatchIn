// src/features/candidate/hooks/useCvStatusQuery.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchCvStatusRequest,
  normalizeCvStatus,
} from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";

/**
 * Statuses that indicate the CV is still being processed.
 * Backend returns: "processing" for document, "pending" for extraction.
 * We poll while ANY extraction is pending or document is processing.
 */
const IN_PROGRESS_STATUSES = ["processing", "pending", "uploaded", "queued"];

/**
 * Statuses that indicate completion (success or failure).
 * We stop polling on these.
 */
const TERMINAL_STATUSES = ["completed", "failed", "error", "cancelled"];

/**
 * Check if a CV status indicates processing is still in progress.
 * Considers both document status and extraction statuses.
 * @param {Object} cvStatus - Normalized CV status
 * @returns {boolean}
 */
export const isCvStatusInProgress = (cvStatus) => {
  if (!cvStatus) return false;

  // Document-level status
  const docStatus = cvStatus.status?.toLowerCase();
  if (IN_PROGRESS_STATUSES.includes(docStatus)) return true;
  if (TERMINAL_STATUSES.includes(docStatus)) return false;

  // Extraction-level statuses - if any extraction is pending, we're still processing
  const extractions = cvStatus.extractions ?? [];
  if (extractions.length > 0) {
    const hasPendingExtraction = extractions.some(
      (e) => IN_PROGRESS_STATUSES.includes((e.status ?? "").toLowerCase())
    );
    if (hasPendingExtraction) return true;

    // If all extractions are terminal, we're done
    const allTerminal = extractions.every((e) =>
      TERMINAL_STATUSES.includes((e.status ?? "").toLowerCase())
    );
    if (allTerminal) return false;
  }

  // Unknown status - stop polling and report
  console.warn("[useCvStatusQuery] Unknown CV status:", cvStatus.status);
  return false;
};

/**
 * Get the refetch interval for polling.
 * Starts at 2s, backs off to 5s.
 * Returns false to stop polling.
 * @param {Object} query - TanStack query object
 * @returns {number|false}
 */
export const getCvStatusRefetchInterval = (query) => {
  const data = query.state.data;
  if (!data || !isCvStatusInProgress(data)) {
    return false; // Stop polling
  }
  // Back off: 2s for first ~60s, then 5s
  // We can't easily track elapsed time here, so use a simple approach
  return 3000; // 3s average
};

/**
 * Maximum polling duration in ms (3 minutes).
 * After this, stop polling and show "taking longer" message.
 */
const MAX_POLLING_DURATION = 3 * 60 * 1000;

/**
 * CV Status query with intelligent polling.
 * Polls while processing, stops on completed/failed.
 * Resumes on window focus if still in progress.
 * @param {string} cvDocumentId
 * @returns TanStack query result
 */
export const useCvStatusQuery = (cvDocumentId, options = {}) => {
  // Track when polling started for this document
  const pollStartRef = { current: null };

  return useQuery({
    queryKey: candidateKeys.cv.status(cvDocumentId),
    queryFn: async () => {
      try {
        return normalizeCvStatus(await fetchCvStatusRequest(cvDocumentId));
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    enabled: !!cvDocumentId,
    staleTime: 0, // Always fresh when polling
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || !isCvStatusInProgress(data)) {
        pollStartRef.current = null;
        return false;
      }

      // Track polling start time
      if (!pollStartRef.current) {
        pollStartRef.current = Date.now();
      }

      // Stop after max duration
      if (Date.now() - pollStartRef.current > MAX_POLLING_DURATION) {
        pollStartRef.current = null;
        return false;
      }

      return 3000; // 3s interval
    },
    refetchOnWindowFocus: true, // Resume on focus if still in progress
    retry: 1,
    ...options,
  });
};