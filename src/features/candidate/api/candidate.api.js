// src/features/candidate/api/candidate.api.js
import { api } from "@/services/axios/axiosInstance";

/**
 * GET /api/candidate/profile
 * Fetches the authenticated candidate's profile data for prefilling onboarding.
 * Returns normalized profile data matching the onboarding step fields.
 */
export const fetchCandidateProfileRequest = () =>
  api.get("/api/candidate/profile").then((res) => res.data?.data ?? res.data);

/**
 * Normalizes the backend profile response to match the onboarding form shape.
 * Expected backend shape: { jobTitle, jobType, workStyle, location, experience, goals, ... }
 */
export const normalizeCandidateProfile = (data) => {
  if (!data) return null;

  return {
    jobTitle: data.jobTitle ?? "",
    jobType: data.jobType ?? "",
    workStyle: data.workStyle ?? "",
    location: data.location ?? "",
    experience: data.experience ?? "",
    goals: data.goals ?? "",
    // Include any additional fields the backend might return
    ...data,
  };
};