// src/features/candidate/api/candidate.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * GET /api/candidate/profile
 * Returns the raw server payload so callers can inspect profile_exists and the
 * nested profile object while the normalizer maps it into onboarding form fields.
 */
export const fetchCandidateProfileRequest = () =>
  api.get("/api/candidate/profile").then(unwrapServerData);

/**
 * PATCH /api/candidate/profile
 */
export const updateCandidateProfileRequest = (payload) =>
  api.patch("/api/candidate/profile", payload).then(unwrapServerData);

/**
 * PATCH /api/candidate/career-preferences
 */
export const updateCareerPreferencesRequest = (payload) =>
  api.patch("/api/candidate/career-preferences", payload).then(unwrapServerData);

/**
 * Normalizes the backend profile response to the form shape used by onboarding.
 * Backend contract: { profile_exists, user, profile: { job_title, job_type, ... } }
 */
export const normalizeCandidateProfile = (response) => {
  if (!response) return null;

  const payload = response.profile ?? response;

  const normalized = {
    profile_exists: response.profile_exists ?? Boolean(payload),
    profile_completed_at:
      payload?.profile_completed_at ?? response?.profile_completed_at ?? null,
    jobTitle: payload?.job_title ?? payload?.jobTitle ?? "",
    jobType: payload?.job_type ?? payload?.jobType ?? "",
    workStyle: payload?.work_style ?? payload?.workStyle ?? "",
    location: payload?.location ?? "",
    experience:
      payload?.experience_level ?? payload?.experience ?? "",
    goals: payload?.career_goal ?? payload?.goals ?? "",
    ...payload,
  };

  if (response.profile && "profile" in response) {
    normalized.profile = payload;
  }

  return normalized;
};