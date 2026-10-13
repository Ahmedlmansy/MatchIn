// src/features/candidate/hooks/useCvStatusQuery.js
import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCvStatusRequest,
  normalizeCvStatus,
} from "@/features/candidate/api/cv.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";

/**
 * Statuses that indicate the CV or extraction is still being processed.
 */
export const IN_PROGRESS_STATUSES = ["processing", "pending", "uploaded", "queued"];

/**
 * Statuses that indicate terminal completion (success or failure).
 */
export const TERMINAL_STATUSES = ["completed", "failed", "error", "cancelled"];

/**
 * Check if a CV status indicates processing is still in progress.
 */
export const isCvStatusInProgress = (cvStatus) => {
  if (!cvStatus) return false;

  const docStatus = cvStatus.status?.toLowerCase();
  if (IN_PROGRESS_STATUSES.includes(docStatus)) return true;
  if (TERMINAL_STATUSES.includes(docStatus)) return false;

  const extractions = cvStatus.extractions ?? [];
  if (extractions.length > 0) {
    const hasPendingExtraction = extractions.some((e) =>
      IN_PROGRESS_STATUSES.includes((e.status ?? "").toLowerCase())
    );
    if (hasPendingExtraction) return true;

    const allTerminal = extractions.every((e) =>
      TERMINAL_STATUSES.includes((e.status ?? "").toLowerCase())
    );
    if (allTerminal) return false;
  }

  // Unknown status - stops polling
  return false;
};

/**
 * Check if CV document or extraction has reached terminal status.
 */
export const isCvStatusTerminal = (cvStatus) => {
  if (!cvStatus) return false;
  const docStatus = cvStatus.status?.toLowerCase();
  if (TERMINAL_STATUSES.includes(docStatus)) return true;

  const extractions = cvStatus.extractions ?? [];
  return (
    extractions.length > 0 &&
    extractions.every((e) => TERMINAL_STATUSES.includes((e.status ?? "").toLowerCase()))
  );
};

/**
 * Check if CV has an unknown/unrecognized status.
 */
export const isCvStatusUnknown = (cvStatus) => {
  if (!cvStatus) return false;
  return !isCvStatusInProgress(cvStatus) && !isCvStatusTerminal(cvStatus);
};

/**
 * Maximum polling duration in ms (3 minutes).
 */
export const MAX_POLLING_DURATION = 3 * 60 * 1000;

/**
 * CV Status query with intelligent polling.
 * - Polls every 3000ms while in progress.
 * - Stops on completed/failed or unknown status.
 * - Stops after 3 minutes and flags `isTakingLonger`.
 * - Does NOT poll in background tab (refetchIntervalInBackground: false).
 * - Exposes `isTakingLonger`, `isUnknownStatus`, and `resetPollingTimer`.
 */
export const useCvStatusQuery = (cvDocumentId, options = {}) => {
  const pollStartRef = useRef(null);
  const [isTakingLonger, setIsTakingLonger] = useState(false);

  const resetPollingTimer = useCallback(() => {
    pollStartRef.current = Date.now();
    setIsTakingLonger(false);
  }, []);

  const query = useQuery({
    queryKey: candidateKeys.cv.status(cvDocumentId),
    queryFn: async () => {
      try {
        const data = normalizeCvStatus(await fetchCvStatusRequest(cvDocumentId));
        if (data && !isCvStatusInProgress(data)) {
          setIsTakingLonger(false);
        }
        return data;
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    enabled: !!cvDocumentId,
    staleTime: 0,
    refetchIntervalInBackground: false,
    refetchInterval: (q) => {
      const data = q.state.data;
      if (!data || !isCvStatusInProgress(data)) {
        pollStartRef.current = null;
        return false;
      }

      if (!pollStartRef.current) {
        pollStartRef.current = Date.now();
      }

      if (Date.now() - pollStartRef.current > MAX_POLLING_DURATION) {
        setIsTakingLonger(true);
        return false;
      }

      return 3000;
    },
    refetchOnWindowFocus: true,
    retry: 1,
    ...options,
  });

  const isUnknown = isCvStatusUnknown(query.data);

  return {
    ...query,
    isTakingLonger,
    isUnknownStatus: isUnknown,
    resetPollingTimer,
  };
};