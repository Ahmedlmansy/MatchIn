// src/features/candidate/api/jobs.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * GET /api/jobs
 * Query params: page, limit, search, location, workType, experienceLevel, sortBy
 * Returns: { data: Job[], meta: { total, page, limit, totalPages } }
 */
export const fetchJobsRequest = (params = {}) =>
  api.get("/api/jobs", { params }).then(unwrapServerData);

/**
 * GET /api/jobs/{jobId}
 * Returns: { data: JobDetail }
 */
export const fetchJobDetailsRequest = (jobId) =>
  api.get(`/api/jobs/${jobId}`).then(unwrapServerData);

/**
 * POST /api/jobs/{jobId}/save
 * Returns: { data: { saved: boolean } }
 */
export const saveJobRequest = (jobId) =>
  api.post(`/api/jobs/${jobId}/save`).then((res) => res.data);

/**
 * DELETE /api/jobs/{jobId}/save
 * Returns: { data: { saved: boolean } }
 */
export const unsaveJobRequest = (jobId) =>
  api.delete(`/api/jobs/${jobId}/save`).then((res) => res.data);

/**
 * GET /api/saved-jobs
 * Query params: page, limit, sortBy
 * Returns: { data: SavedJob[], meta: { total, page, limit, totalPages } }
 */
export const fetchSavedJobsRequest = (params = {}) =>
  api.get("/api/saved-jobs", { params }).then(unwrapServerData);

/**
 * POST /api/jobs/{jobId}/apply
 * Body: { cvId, authorized, startDate, note }
 * Returns: { data: Application }
 */
export const applyToJobRequest = (jobId, payload) =>
  api.post(`/api/jobs/${jobId}/apply`, payload).then((res) => res.data);

/**
 * Normalize job list item
 */
export const normalizeJob = (item) => ({
  id: item.id,
  company: item.company,
  initial: item.initial ?? item.company?.[0]?.toUpperCase() ?? "J",
  logoClass: item.logoClass ?? "bg-primary/10 text-primary",
  verified: item.verified ?? false,
  location: item.location,
  locationIcon: item.locationIcon ?? (item.location?.toLowerCase().includes("remote") ? "globe" : "pin"),
  matchPercent: item.matchPercent ?? item.match_score ?? 0,
  title: item.title,
  salaryRange: item.salaryRange ?? item.salary_range,
  tags: item.tags ?? item.skills ?? [],
  postedAgo: item.postedAgo ?? item.posted_ago,
  categories: item.categories ?? [],
  // Extended fields for details
  description: item.description,
  responsibilities: item.responsibilities ?? [],
  requirements: item.requirements ?? [],
  preferredSkills: item.preferred_skills ?? item.preferredSkills ?? [],
  experience: item.experience,
  employmentType: item.employment_type ?? item.employmentType,
  workStyle: item.work_style ?? item.workStyle,
  source: item.source,
  method: item.method,
  deadline: item.deadline,
  fitScore: item.fitScore ?? item.fit_score,
  fitFraction: item.fitFraction ?? item.fit_fraction,
  fitLabel: item.fitLabel ?? item.fit_label,
  strength: item.strength,
  gap: item.gap,
  gapActionText: item.gap_action_text ?? item.gapActionText,
  note: item.note,
  status: item.status,
  appliedText: item.applied_text ?? item.appliedText,
});

/**
 * Normalize job list response
 */
export const normalizeJobsResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return { jobs: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };

  const jobs = Array.isArray(data) ? data : data.data ?? data.items ?? [];
  const meta = data.meta ?? data.pagination ?? { total: jobs.length, page: 1, limit: 20, totalPages: 1 };

  return {
    jobs: jobs.map(normalizeJob),
    meta,
  };
};

/**
 * Normalize saved job (extends base job with saved-specific fields)
 */
export const normalizeSavedJob = (item) => ({
  ...normalizeJob(item),
  rationaleTitle: item.rationale_title ?? item.rationaleTitle,
  rationaleSub: item.rationale_sub ?? item.rationaleSub,
  extraSkillsCount: item.extra_skills_count ?? item.extraSkillsCount ?? 0,
  verification: item.verification,
  deadline: item.deadline,
  status: item.status ?? "default",
  appliedText: item.applied_text ?? item.appliedText,
});

/**
 * Normalize saved jobs response
 */
export const normalizeSavedJobsResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return { jobs: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };

  const jobs = Array.isArray(data) ? data : data.data ?? data.items ?? [];
  const meta = data.meta ?? data.pagination ?? { total: jobs.length, page: 1, limit: 20, totalPages: 1 };

  return {
    jobs: jobs.map(normalizeSavedJob),
    meta,
  };
};

/**
 * Normalize job details response
 */
export const normalizeJobDetails = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;
  return normalizeJob(data);
};