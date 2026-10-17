// src/features/admin/api/admin-jobs.api.js
//
// GET|POST /api/admin/jobs
// GET|PATCH /api/admin/jobs/{jobPost}
//
// Admin-only job administration. The public /api/jobs endpoint is read-only
// for candidates, so everything an admin can *write* lives here.

import { api } from "@/services/axios/axiosInstance";
import {
  unwrap,
  pick,
  toList,
  toText,
  toId,
  normalizePaginated,
} from "./normalize";
import { initialsOf } from "@/features/admin/shared/formatting/locale";

const DAY_MS = 86_400_000;

/** Days between an ISO timestamp and now; null when the date is absent. */
export const daysSince = (isoDate) => {
  const timestamp = isoDate ? new Date(isoDate).getTime() : NaN;
  return Number.isNaN(timestamp) ? null : Math.max(0, (Date.now() - timestamp) / DAY_MS);
};

/**
 * Note on display strings: this module used to derive `pubDate` and
 * `freshness` here with Intl.DateTimeFormat("en-US") and hand the components a
 * finished English string. That froze the locale in api/, which
 * AUTH_LOGIC_CONVENTION.md §5 forbids, and made every date English regardless
 * of the active language. Only raw values cross this boundary now;
 * shared/formatting/locale.js formats them at render time.
 */

// --- normalizers ------------------------------------------------------------

/**
 * One job row -> the exact shape <JobRow /> renders.
 *
 * Every field is read through pick() with an alias list, so the common
 * snake_case/camelCase and flat/nested disagreements between Laravel
 * resources only ever need an alias added here.
 */
export function normalizeJob(raw) {
  const company = pick(raw, ["company", "company_data"], {}) ?? {};
  const status = (toText(pick(raw, ["status", "state"], "draft")) ?? "draft").toLowerCase();
  const publishedAt = pick(raw, ["published_at", "publishedAt", "published_date"]);
  const createdAt = pick(raw, ["created_at", "createdAt"]);

  return {
    id: toId(pick(raw, ["id", "job_post_id", "uuid"])),
    title: toText(pick(raw, ["title", "job_title", "name"])) ?? "Untitled job",
    companyId: toId(pick(company, ["id", "company_id"])),
    company: toText(pick(company, ["name", "company_name"])) ?? "—",
    companyInitials: initialsOf(pick(company, ["name"])),
    location: toText(pick(raw, ["location", "city", "location_name"])) ?? "—",
    // work_mode and location are separate backend fields; the mock conflated
    // them ("Hybrid · Full-time" in one `location` string), so they are read
    // independently here.
    workMode: toText(pick(raw, ["work_mode", "workMode", "work_mode_label"])) ?? "—",
    type: toText(pick(raw, ["employment_type", "employmentType", "type", "job_type"])) ?? "Full-time",
    status,
    source: toText(pick(raw, ["source", "job_source", "origin"], "internal")) ?? "internal",
    sourceLabel: toText(pick(raw, ["source_label", "sourceLabel", "source_name"])) ?? "Internal",
    sourceUrl: toText(pick(raw, ["source_url", "sourceUrl", "url", "external_url"])),
    freshnessDays: daysSince(publishedAt) ?? 0,
    // Raw timestamps last: some callers need the unformatted value.
    publishedAt,
    createdAt,
  };
}

/** Job detail -> the shape the editable detail screen needs. */
export function normalizeJobDetail(raw) {
  const job = normalizeJob(raw);
  return {
    ...job,
    level: toText(pick(raw, ["experience_level", "experienceLevel", "level"])) ?? "Mid level",
    description: toText(pick(raw, ["description", "summary", "body"])) ?? "",
    responsibilities: toList(pick(raw, ["responsibilities", "duties"])),
    requiredSkills: toList(pick(raw, ["required_skills", "requiredSkills"])).map(
      (skill) => (typeof skill === "string" ? skill : (skill?.name ?? "")),
    ).filter(Boolean),
    preferredSkills: toList(pick(raw, ["preferred_skills", "preferredSkills"])).map(
      (skill) => (typeof skill === "string" ? skill : (skill?.name ?? "")),
    ).filter(Boolean),
    applicationMethod: toText(pick(raw, ["application_method", "applicationMethod"])) ?? "Internal",
    postedBy:
      toText(pick(raw, ["posted_by", "postedBy"])) ??
      toText(pick(pick(raw, ["company", "company_data"], {}), ["name", "company_name"])) ??
      job.company,
  };
}

/** "Vercel" -> "V"; "Cloud Scale Systems" -> "CS". Built in the shared
 *  formatter so initials read the same everywhere in the admin surface. */
export { initialsOf };

// --- requests ---------------------------------------------------------------

/**
 * GET /api/admin/jobs?search=&status=&sort=&page=
 * Filters and sorting are server-side: the backend owns the ordering, so the
 * list reflects the same sort a candidate would see on /api/jobs.
 */
export const fetchAdminJobsRequest = async (filters = {}) => {
  const response = await api.get("/api/admin/jobs", { params: filters });
  const { items, ...meta } = normalizePaginated(response, { perPage: 15 });
  return { items: items.map(normalizeJob), ...meta };
};

/** GET /api/admin/jobs/{jobPost} */
export const fetchAdminJobRequest = async (jobId) => {
  const response = await api.get(`/api/admin/jobs/${jobId}`);
  return normalizeJobDetail(unwrap(response));
};

/**
 * POST /api/admin/jobs
 * `payload` is already in the backend's snake_case field names; the api layer
 * never renames on the way out.
 */
export const createAdminJobRequest = async (payload) => {
  const response = await api.post("/api/admin/jobs", payload);
  return normalizeJobDetail(unwrap(response));
};

/** PATCH /api/admin/jobs/{jobPost} — partial update (status-only or full edit). */
export const updateAdminJobRequest = async ({ id, ...payload }) => {
  const response = await api.patch(`/api/admin/jobs/${id}`, payload);
  return normalizeJobDetail(unwrap(response));
};