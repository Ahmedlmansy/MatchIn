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

const DAY_MS = 86_400_000;

/** Days between an ISO timestamp and now; null when the date is absent. */
export const daysSince = (isoDate) => {
  const timestamp = isoDate ? new Date(isoDate).getTime() : NaN;
  return Number.isNaN(timestamp) ? null : Math.max(0, (Date.now() - timestamp) / DAY_MS);
};

/** "Sep 15" / "Not published" — the compact form the job table shows. */
function shortDate(isoDate, emptyLabel = "—") {
  if (!isoDate) return emptyLabel;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return emptyLabel;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

/** "Fresh · 3h ago" — mirrors the wording the freshness pill already expects. */
function freshnessLabel(isoDate, status) {
  if (!isoDate) return status === "draft" ? "Not published" : "—";
  const hours = Math.floor(daysSince(isoDate));
  if (hours < 1) return "Fresh · just now";
  if (hours < 24) return `Fresh · ${hours}h ago`;
  if (hours <= 7) return `Fresh · ${hours}d ago`;
  return `Stale · ${hours}d ago`;
}

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
    freshness: freshnessLabel(publishedAt, status),
    freshnessDays: daysSince(publishedAt) ?? 0,
    pubDate: shortDate(publishedAt, "Not published"),
    createdDate: shortDate(createdAt),
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

/** "Vercel" -> "V"; "Cloud Scale Systems" -> "CS". */
export function initialsOf(name) {
  if (!name) return "?";
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

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