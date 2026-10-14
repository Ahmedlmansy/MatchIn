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
 * Backend response (new schema):
 * {
 *   status: "success",
 *   data: {
 *     id: 42,
 *     file_name: "resume.pdf",
 *     parsing_status: "completed",
 *     parsed_data: {
 *       headline: "Senior Full-Stack Engineer",
 *       extracted_skills: ["Node.js", "Express", "Sequelize", "Docker"],
 *       confidence_score: 0.94
 *     }
 *   }
 * }
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
 * Body: { verified_skills: [{ skill_name, proficiency, years_of_experience }], update_profile: true/false }
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
    original_filename: item.original_filename ?? item.file_name,
    version: item.version,
    is_current: item.is_current,
    status: item.status ?? item.parsing_status,
    file_size: item.file_size,
    mime_type: item.mime_type,
    processed_at: item.processed_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
};

/**
 * Normalize CV status response (new backend schema)
 * Backend response:
 * {
 *   status: "success",
 *   data: {
 *     id: 42,
 *     file_name: "resume.pdf",
 *     parsing_status: "completed",
 *     parsed_data: {
 *       headline: "Senior Full-Stack Engineer",
 *       extracted_skills: ["Node.js", "Express", "Sequelize", "Docker"],
 *       confidence_score: 0.94
 *     }
 *   }
 * }
 */
export const normalizeCvStatus = (response) => {
  const data = unwrapServerData(response);

  if (!data || typeof data !== "object") return null;

  return {
    id: data.id,
    original_filename: data.original_filename ?? data.file_name,
    file_name: data.file_name,
    mime_type: data.mime_type,
    file_size: data.file_size,
    version: data.version,
    is_current: data.is_current,
    // Support both old `status` and new `parsing_status`
    status: data.parsing_status ?? data.status,
    parsing_status: data.parsing_status ?? data.status,
    processed_at: data.processed_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    // New parsed data structure
    parsed_data: data.parsed_data ? {
      headline: data.parsed_data.headline,
      extracted_skills: data.parsed_data.extracted_skills ?? [],
      confidence_score: data.parsed_data.confidence_score ?? 0,
    } : null,
    // Legacy extractions for backward compatibility
    extractions: [],
    ...data,
  };
};