// src/features/admin/api/admin-companies.api.js
//
// GET|POST /api/admin/companies
// GET|PATCH /api/admin/companies/{company}
// POST /api/admin/companies/{sourceCompany}/merge

import { api } from "@/services/axios/axiosInstance";
import {
  unwrap,
  pick,
  toNumber,
  toList,
  toText,
  toId,
  normalizePaginated,
} from "./normalize";
import { initialsOf } from "./admin-jobs.api";

/**
 * Verification status lives in exactly three visual states, but the backend
 * may say "rejected" / "unverified" / "suspended". Collapse every spelling
 * into the three the UI renders.
 */
export function normalizeCompanyStatus(raw) {
  const value = String(toText(raw) ?? "pending").toLowerCase();
  if (["verified", "approved", "active", "accepted"].includes(value)) return "verified";
  if (["not-verified", "unverified", "rejected", "suspended", "declined"].includes(value)) {
    return "not-verified";
  }
  return "pending";
}

/**
 * Company row -> the shape <CompanyRow /> renders.
 * `avatarClass` is derived from a hash of the id rather than hard-coded per
 * record, so a newly-created company gets a stable colour with no data change.
 */
export function normalizeCompany(raw) {
  const id = toId(pick(raw, ["id", "company_id", "uuid"]));
  const name = toText(pick(raw, ["name", "company_name", "legal_name"])) ?? "—";

  return {
    id,
    name,
    initials: initialsOf(name),
    avatarClass: avatarClassFor(id ?? name),
    status: normalizeCompanyStatus(pick(raw, ["status", "verification_status", "state"])),
    email: toText(pick(raw, ["email", "contact_email"])) ?? "—",
    phone: toText(pick(raw, ["phone", "contact_phone", "phone_number"])) ?? "",
    website: toText(pick(raw, ["website", "url", "domain"])),
    createdAt: pick(raw, ["created_at", "createdAt"]),
    updatedAt: pick(raw, ["updated_at", "updatedAt"]),
  };
}

// Stable colour-per-record: the same company always renders in the same tile.
const AVATAR_CLASSES = [
  "bg-[#3d6b8a] text-white",
  "bg-[#5a6b4f] text-white",
  "bg-primary text-white",
  "bg-secondary text-white",
  "bg-[#6b4f6b] text-white",
  "bg-accent text-ink",
  "bg-[#4a6fa5] text-white",
  "bg-[#2d5a4a] text-white",
];

export function avatarClassFor(seed = "") {
  const key = String(seed);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i)) % 997;
  return AVATAR_CLASSES[hash % AVATAR_CLASSES.length];
}

// --- requests ---------------------------------------------------------------

/** GET /api/admin/companies?search=&status=&sort=&page= */
export const fetchAdminCompaniesRequest = async (filters = {}) => {
  const response = await api.get("/api/admin/companies", { params: filters });
  const { items, ...meta } = normalizePaginated(response, { perPage: 8 });
  return { items: items.map(normalizeCompany), ...meta };
};

/** GET /api/admin/companies/{company} */
export const fetchAdminCompanyRequest = async (companyId) => {
  const response = await api.get(`/api/admin/companies/${companyId}`);
  return normalizeCompanyDetail(unwrap(response));
};

/**
 * Company detail -> every block the details screen renders.
 * Jobs, activity and stats are all derived server-side; an absent section
 * yields an empty array / zeroed counters rather than placeholder objects.
 */
export function normalizeCompanyDetail(raw) {
  const base = normalizeCompany(raw);

  return {
    ...base,
    status: normalizeCompanyStatus(pick(raw, ["status", "verification_status", "state"])),
    profile: {
      legalName: toText(pick(raw, ["legal_name", "legalName"])),
      industry: toText(pick(raw, ["industry", "sector"])),
      size: toText(pick(raw, ["size", "company_size", "headcount"])),
      website: toText(pick(raw, ["website", "url"])),
      headquarters: toText(pick(raw, ["headquarters", "location", "address"])),
      about: toText(pick(raw, ["about", "description", "summary"])),
    },
    contact: {
      email: toText(pick(raw, ["email", "contact_email"])) ?? "—",
      phone: toText(pick(raw, ["phone", "contact_phone"])) ?? "—",
      hrEmail: toText(pick(raw, ["hr_email", "hrEmail", "careers_email"])),
      linkedin: toText(pick(raw, ["linkedin", "linkedin_url"])),
    },
    jobs: toList(pick(raw, ["jobs", "job_posts"])).map(normalizeCompanyJob),
    activity: toList(pick(raw, ["activity", "recent_activity", "timeline"])).map(
      (item, index) => ({
        id: toId(pick(item, ["id"]), `activity-${index}`),
        tone: toText(pick(item, ["tone", "type"]), "primary"),
        text: toText(pick(item, ["text", "description", "action", "title"])) ?? "",
        meta: toText(pick(item, ["meta", "occurred_at", "created_at"])) ?? "",
      }),
    ),
    stats: {
      openJobs: toNumber(pick(raw, ["open_jobs", "openJobs"])),
      totalApplications: toNumber(pick(raw, ["total_applications", "totalApplications"])),
      applicationsThisWeek: toNumber(pick(raw, ["applications_this_week", "applicationsThisWeek"])),
      drafts: toNumber(pick(raw, ["drafts", "draft_jobs"])),
    },
    submittedAt: pick(raw, ["submitted_at", "submittedAt"]),
    dates: {
      created: pick(raw, ["created_at", "createdAt"]),
      updated: pick(raw, ["updated_at", "updatedAt"]),
    },
  };
}

function normalizeCompanyJob(raw) {
  const status = (toText(pick(raw, ["status"]), "active") ?? "active").toLowerCase();
  return {
    id: toId(pick(raw, ["id", "job_post_id"])),
    title: toText(pick(raw, ["title"])) ?? "Untitled",
    meta: toList(pick(raw, ["meta", "labels"])),
    status,
    statusLabel: toText(pick(raw, ["status_label", "statusLabel"])) ?? status,
  };
}

/**
 * Component-facing field names -> the backend's wire names for
 * POST /api/admin/companies.
 *
 * These five keys are the endpoint's contract. They are all single words, so
 * they happen to read the same on both sides today — the map exists so the wire
 * format is defined in exactly one place instead of being implied by whichever
 * form happens to build the object, and so a future multi-word field has an
 * obvious home. See the equivalent note on USER_FIELD_ALIASES for why this is
 * not optional: Laravel drops unknown keys silently, so a create can report
 * success and save nothing at all.
 */
const COMPANY_FIELD_ALIASES = {
  name: "name",
  website: "website",
  industry: "industry",
  description: "description",
  location: "location",
};

/**
 * Renames aliased keys, trims strings, and omits empty optional fields so a
 * blank input never reaches the backend as "".
 */
const toCompanyPayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload)
      .map(([key, value]) => [
        COMPANY_FIELD_ALIASES[key] ?? key,
        typeof value === "string" ? value.trim() : value,
      ])
      .filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

/**
 * POST /api/admin/companies
 * The payload is mapped to backend-native names here rather than being posted
 * verbatim, so the form can keep using the camelCase shape the rest of the app
 * reads.
 */
export const createAdminCompanyRequest = async (payload) => {
  const response = await api.post("/api/admin/companies", toCompanyPayload(payload));
  return normalizeCompany(unwrap(response));
};

/** PATCH /api/admin/companies/{company} — partial update. */
export const updateAdminCompanyRequest = async ({ id, ...payload }) => {
  const response = await api.patch(`/api/admin/companies/${id}`, payload);
  return normalizeCompany(unwrap(response));
};

/**
 * POST /api/admin/companies/{sourceCompany}/merge
 * `target_id` is the company that survives the merge.
 */
export const mergeAdminCompaniesRequest = async ({ id, target_id }) => {
  const response = await api.post(`/api/admin/companies/${id}/merge`, { target_id });
  return unwrap(response);
};

/**
 * Sets verification status by reusing PATCH /api/admin/companies/{company}.
 * Verify and Reject are the same operation with a different status, so they
 * share one request function rather than duplicating the call site.
 */
export const setAdminCompanyStatusRequest = async ({ id, status }) =>
  updateAdminCompanyRequest({ id, status });