// src/features/candidate/api/cv.api.js
import { api } from "@/services/axios/axiosInstance";

/**
 * Shared unwrap helper that unwraps `{ data: ... }` envelopes by KEY PRESENCE,
 * not truthiness or `??`, because responses like `verify` can legitimately return `data: null`.
 */
export const unwrapServerData = (response) => {
  const body = response?.data !== undefined ? response.data : response;
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body ?? null;
};

/**
 * POST /api/cv/upload
 * Upload a CV file (multipart/form-data, field name: "cv")
 * Returns envelope: { status, message, data }
 */
export const uploadCvRequest = (file, options = {}) => {
  const formData = new FormData();
  formData.append("cv", file);

  const requestOptions = {
    timeout: 120_000, // 120s per-request timeout
    signal: options.signal,
    onUploadProgress: options.onUploadProgress,
    ...options,
    headers: {
      ...(options.headers ?? {}),
    },
  };

  // Ensure browser sets multipart/form-data boundary automatically
  if (requestOptions.headers && "Content-Type" in requestOptions.headers) {
    delete requestOptions.headers["Content-Type"];
  }

  return api.post("/api/cv/upload", formData, requestOptions).then((res) => res.data);
};

/**
 * GET /api/cv/history
 * Returns { data: [...] } - list of CV documents
 */
export const fetchCvHistoryRequest = () =>
  api.get("/api/cv/history").then(unwrapServerData);

/**
 * GET /api/cv/status/{cvDocument}
 * Returns { data: {...} } - single CV document with extractions
 */
export const fetchCvStatusRequest = (cvDocumentId) =>
  api.get(`/api/cv/status/${cvDocumentId}`).then(unwrapServerData);

/**
 * POST /api/cv/retry/{cvDocument}
 * Retry a failed extraction
 * Returns envelope: { status, message, data: { id, status: "processing" } }
 */
export const retryCvRequest = (cvDocumentId) =>
  api.post(`/api/cv/retry/${cvDocumentId}`).then((res) => res.data);

/**
 * POST /api/cv/extractions/{extraction}/verify
 * Verify an extraction (merge into profile)
 * Body: { skills: [...], experiences: [...] }
 * Returns envelope: { status, message, data: null }
 */
export const verifyCvExtractionRequest = (extractionId, payload) =>
  api.post(`/api/cv/extractions/${extractionId}/verify`, payload).then((res) => res.data);

/**
 * Normalize CV history response
 */
export const normalizeCvHistory = (response) => {
  const data = unwrapServerData(response);

  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item.id,
    original_filename: item.original_filename,
    version: item.version,
    is_current: item.is_current,
    status: item.status,
    file_size: item.file_size,
    mime_type: item.mime_type,
    processed_at: item.processed_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
};

/**
 * Normalize CV status response
 */
export const normalizeCvStatus = (response) => {
  const data = unwrapServerData(response);

  if (!data || typeof data !== "object") return null;

  return {
    id: data.id,
    original_filename: data.original_filename,
    mime_type: data.mime_type,
    file_size: data.file_size,
    version: data.version,
    is_current: data.is_current,
    status: data.status,
    processed_at: data.processed_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    extractions: Array.isArray(data.extractions) ? data.extractions : [],
    ...data,
  };
};