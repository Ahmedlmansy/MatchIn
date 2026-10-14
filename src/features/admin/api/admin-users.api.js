// src/features/admin/api/admin-users.api.js
//
// GET|POST /api/admin/users
// GET|PATCH|DELETE /api/admin/users/{user}
//
// NOTE: the audit's endpoint inventory (§3) does not list these routes, but
// its P1 plan (#18) names them as the target for User Management, and the
// page already carried `GET /admin/users/:userId` TODO markers pointing here.
// If the backend exposes a different prefix, this file is the only place to
// change — no component reads a URL.

import { api } from "@/services/axios/axiosInstance";
import { normalizeRole as normalizeRoleValue } from "@/features/auth/store/auth.roles";
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

const DAY_MS = 86_400_000;

/**
 * The roles an admin may assign from the user-management dropdown.
 *
 * Deliberately NOT named ADMIN_ROLES: that name now belongs to
 * features/auth/store/auth.roles.js, which means "roles that grant admin
 * access". These are the roles you can hand out.
 */
export const ASSIGNABLE_ROLES = ["candidate", "recruiter", "admin"];

/**
 * The four account states the user badges render.
 *
 * `normalizeUserStatus` accepts a boolean `is_active` as well as a string,
 * because the normalizer lists is_active among its aliases — see there.
 */
const USER_STATUSES = ["active", "inactive", "suspended"];

/**
 * Role for display + filtering.
 *
 * Delegates the admin-role collapsing (super_admin/superadmin/administrator →
 * "admin") to the shared helper so routing and this list can never disagree.
 * The result is then clamped to the assignable set: an unrecognised backend
 * role must not reach <RoleBadge />, which would render an undefined label.
 */
const normalizeRole = (raw) => {
  const role = normalizeRoleValue(raw);
  return ASSIGNABLE_ROLES.includes(role) ? role : "candidate";
};

/**
 * Account state -> one of USER_STATUSES.
 *
 * `is_active` is one of the aliases normalizeUser reads, and Laravel sends it
 * as a real boolean. Booleans and 0/1 therefore have to be handled *before* the
 * text coercion: String(true) is "true", which is not an account state, so
 * every user with `{ is_active: true }` and no `status` key fell through to the
 * "unrecognised" branch and rendered as Inactive — in the table, in the Active /
 * Inactive / Suspended counters, and in the detail page's suspend/activate
 * toggle. An admin looking at a list of healthy accounts saw a wall of
 * "Inactive" and a button inviting them to activate users who were already
 * active.
 */
const normalizeUserStatus = (raw) => {
  if (typeof raw === "boolean") return raw ? "active" : "inactive";
  if (raw === 1 || raw === 0) return raw === 1 ? "active" : "inactive";

  const value = String(toText(raw) ?? "active").toLowerCase();
  if (value === "banned" || value === "blocked") return "suspended";
  return USER_STATUSES.includes(value) ? value : "inactive";
};

/** Whole days since an ISO timestamp; null when the date is absent. */
const daysSince = (iso) => {
  const time = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(time) ? null : Math.max(0, Math.floor((Date.now() - time) / DAY_MS));
};

const dateLabel = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

/** "4 days ago" / "1 hr ago" / "Just now" — the muted line under a date. */
function relativeLabel(iso) {
  if (!iso) return "Never";
  const days = daysSince(iso);
  if (days === null) return "—";
  if (days === 0) {
    const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
    if (hours <= 0) return "Just now";
    if (hours === 1) return "1 hr ago";
    return `${hours} hrs ago`;
  }
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/**
 * User row -> the shape <UserTable /> renders.
 * The table shows pre-formatted "4 days ago" strings, so those are derived
 * here rather than re-derived in three different filter/sort comparators.
 */
export function normalizeUser(raw) {
  const id = toId(pick(raw, ["id", "user_id", "uuid"]));
  const name =
    toText(pick(raw, ["full_name", "fullName", "name"])) ??
    toText(pick(raw, ["first_name"])) ??
    "Unnamed user";
  const createdAt = pick(raw, ["created_at", "createdAt"]);
  const lastActivityAt = pick(raw, ["last_activity_at", "lastActivityAt", "last_activity"]);

  return {
    id,
    fullName: name,
    initials: initialsOf(name),
    email: toText(pick(raw, ["email"])) ?? "—",
    role: normalizeRole(pick(raw, ["role", "user_type", "account_type"])),
    status: normalizeUserStatus(pick(raw, ["status", "state", "is_active"])),
    phone: toText(pick(raw, ["phone", "phone_number"])),
    location: toText(pick(raw, ["location", "city", "country"])),
    createdAt,
    lastActivityAt,
    createdLabel: dateLabel(createdAt),
    createdAgo: relativeLabel(createdAt),
    createdDaysAgo: daysSince(createdAt) ?? Number.MAX_SAFE_INTEGER,
    activityLabel: dateLabel(lastActivityAt),
    activityAgo: relativeLabel(lastActivityAt),
    activityDaysAgo: daysSince(lastActivityAt) ?? Number.MAX_SAFE_INTEGER,
  };
}

/**
 * User detail -> every block the details screen renders.
 * Stats come from the server; a section the backend omits renders as empty
 * rather than as fabricated zeroes.
 */
export function normalizeUserDetail(raw) {
  const base = normalizeUser(raw);

  return {
    ...base,
    authProvider: toText(pick(raw, ["auth_provider", "provider"])) ?? "Email / Password",
    emailVerified: Boolean(pick(raw, ["email_verified", "emailVerified"], false)),
    language: toText(pick(raw, ["language", "locale"])) ?? "English",
    jobTitle: toText(pick(raw, ["job_title", "jobTitle", "headline"])) ?? "—",
    experience: toText(pick(raw, ["experience_level", "experience"])) ?? "—",
    bio: toText(pick(raw, ["bio", "summary"])) ?? "",
    skills: toList(pick(raw, ["skills", "candidate_skills"])).map((skill) =>
      typeof skill === "string" ? skill : (skill?.name ?? ""),
    ).filter(Boolean),
    cv: normalizeCv(pick(raw, ["cv", "cv_document", "cv_documents"])),
    stats: normalizeUserStats(pick(raw, ["stats", "statistics"])),
    applications: toList(pick(raw, ["applications"])).map((item) => ({
      id: toId(pick(item, ["id"])),
      title: toText(pick(item, ["title", "job_title"])) ?? "—",
      company: toText(pick(item, ["company", "company_name"])) ?? "—",
      appliedOn: toText(pick(item, ["applied_on", "applied_at", "created_at"])) ?? "—",
      status: toText(pick(item, ["status"]), "submitted") ?? "submitted",
    })),
    savedJobs: normalizeSavedJobs(pick(raw, ["saved_jobs", "savedJobs"])),
    dates: {
      created: { date: base.createdLabel, sub: base.createdAgo },
      lastActivity: { date: base.activityLabel, sub: base.activityAgo },
      lastLogin: {
        date: dateLabel(pick(raw, ["last_login_at", "lastLoginAt"])),
        sub: toText(pick(raw, ["last_login_ip", "lastLoginIp"])),
      },
    },
  };
}

function normalizeCv(raw) {
  const document = Array.isArray(raw) ? raw[0] : raw;
  if (!document) {
    return { uploaded: false, fileName: null, fileSize: null, uploadedAt: null, lastParsed: null };
  }
  return {
    uploaded: true,
    fileName: toText(pick(document, ["file_name", "fileName", "name", "original_name"])),
    fileSize: toText(pick(document, ["file_size", "fileSize", "size"])),
    uploadedAt: toText(pick(document, ["uploaded_at", "uploadedAt", "created_at"])),
    lastParsed: toText(pick(document, ["last_parsed", "lastParsed", "parsed_at"])),
  };
}

function normalizeUserStats(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    applications: {
      value: toNumber(pick(source, ["applications", "applications_count"])),
      sub: toText(pick(source, ["applications_in_review", "applications_sub"])) ?? "",
    },
    savedJobs: {
      value: toNumber(pick(source, ["saved_jobs", "saved_jobs_count"])),
      sub: toText(pick(source, ["saved_jobs_sub"])) ?? "",
    },
    cvStatus: {
      value: toText(pick(source, ["cv_status", "cvStatus"])) ?? "—",
      sub: toText(pick(source, ["cv_status_sub"])) ?? "",
    },
    profile: {
      value: toText(pick(source, ["profile_completion", "profile"])) ?? "—",
      sub: toText(pick(source, ["profile_sub"])) ?? "",
    },
  };
}

function normalizeSavedJobs(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    total: toNumber(pick(source, ["total", "count"])),
    open: toNumber(pick(source, ["open"])),
    expired: toNumber(pick(source, ["expired", "closed"])),
    lastSaved: toText(pick(source, ["last_saved", "lastSaved"])) ?? "—",
  };
}

/**
 * Component-facing field names -> the backend's wire names.
 *
 * The read path above proves the backend is snake_case (full_name, job_title,
 * experience_level), but the forms build camelCase objects — `UserFormBody`
 * submits { fullName, email, role } and the detail page's toForm() submits
 * { fullName, phone, jobTitle, experience, bio }. Those were posted as-is, and
 * Laravel does not reject unknown keys: it drops them. "Edit user" therefore
 * reported success, closed the dialog and invalidated the cache, and saved
 * nothing at all — the user would reload and find their old details.
 *
 * Mapping lives here rather than in the forms so the wire format is defined in
 * exactly one place, and any component can keep using the camelCase shape the
 * rest of the app reads.
 */
const USER_FIELD_ALIASES = {
  fullName: "full_name",
  jobTitle: "job_title",
  experience: "experience_level",
  isActive: "is_active",
  emailVerified: "email_verified",
  lastLoginAt: "last_login_at",
};

/** Renames the aliased keys and passes everything else through untouched. */
const toUserPayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [USER_FIELD_ALIASES[key] ?? key, value]),
  );

// --- requests ---------------------------------------------------------------

/** GET /api/admin/users?search=&role=&status=&sort=&page= */
export const fetchAdminUsersRequest = async (filters = {}) => {
  const response = await api.get("/api/admin/users", { params: filters });
  const { items, ...meta } = normalizePaginated(response, { perPage: 8 });
  return { items: items.map(normalizeUser), ...meta };
};

/** GET /api/admin/users/{user} */
export const fetchAdminUserRequest = async (userId) => {
  const response = await api.get(`/api/admin/users/${userId}`);
  return normalizeUserDetail(unwrap(response));
};

/** POST /api/admin/users */
export const createAdminUserRequest = async (payload) => {
  const response = await api.post("/api/admin/users", toUserPayload(payload));
  return normalizeUser(unwrap(response));
};

/** PATCH /api/admin/users/{user} — partial update (profile fields, role). */
export const updateAdminUserRequest = async ({ id, ...payload }) => {
  const response = await api.patch(`/api/admin/users/${id}`, toUserPayload(payload));
  return normalizeUser(unwrap(response));
};

/**
 * PATCH /api/admin/users/{user} with a status field.
 * Activate / Deactivate / Suspend are the same operation with a different
 * status, so they share one request function.
 */
export const setAdminUserStatusRequest = async ({ id, status }) =>
  updateAdminUserRequest({ id, status });

/** DELETE /api/admin/users/{user} */
export const deleteAdminUserRequest = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return unwrap(response);
};