// src/features/candidate/api/cv.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

/**
 * POST /api/cv/upload
 * Upload a CV file (multipart/form-data, field name: "cv")
 * Returns envelope: { status, message, data }
 */
export const uploadCvRequest = (file, options = {}) => {
  const formData = new FormData();
  formData.append("cv", file);

  const requestOptions = {
    timeout: 120_000, // 120s for large uploads
    ...options,
    headers: {
      ...(options.headers ?? {}),
    },
  };

  // Let the browser set the multipart boundary automatically. If callers pass a
  // Content-Type header, strip it so we don't end up with a malformed request.
  if (requestOptions.headers && "Content-Type" in requestOptions.headers) {
    delete requestOptions.headers["Content-Type"];
  }

  return api.post("/api/cv/upload", formData, requestOptions).then(unwrapServerData);
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
 * Note: extraction data shape may include parsed skills/experiences
 */
export const fetchCvStatusRequest = (cvDocumentId) =>
  api.get(`/api/cv/status/${cvDocumentId}`).then(unwrapServerData);

/**
 * POST /api/cv/retry/{cvDocument}
 * Retry a failed extraction
 * Returns envelope: { status, message, data: { id, status: "processing" } }
 */
export const retryCvRequest = (cvDocumentId) =>
  api.post(`/api/cv/retry/${cvDocumentId}`).then(unwrapServerData);

/**
 * POST /api/cv/extractions/{extraction}/verify
 * Verify an extraction (merge into profile)
 * Body: { skills: [...], experiences: [...] }
 * Returns envelope: { status, message, data: null }
 */
export const verifyCvExtractionRequest = (extractionId, payload) =>
  api.post(`/api/cv/extractions/${extractionId}/verify`, payload).then(unwrapServerData);

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
    // file_size, mime_type, processed_at, created_at, updated_at available if needed
  }));
};

/**
 * Normalize CV status response
 * The extraction data shape is determined by the backend - we pass it through
 * and the mappers will handle extracting skills/experiences from the completed extraction
 */
export const normalizeCvStatus = (response) => {
  const data = unwrapServerData(response);

  if (!data) return null;

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
    // Pass through any additional fields (e.g., parsed_data from completed extraction)
    ...data,
  };
};