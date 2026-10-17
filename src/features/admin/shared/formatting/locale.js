// src/features/admin/shared/formatting/locale.js
//
// Locale-aware formatting for the admin screens.
//
// This module exists because the API normalizers used to bake display strings
// with Intl.DateTimeFormat("en-US") and toUpperCase() directly into their
// return value. That made the language of a response depend on the machine that
// fetched it, and it put a hardcoded locale inside api/ — which
// AUTH_LOGIC_CONVENTION.md §5 forbids ("no toast, no i18n, no navigation").
//
// So the normalizers now return raw timestamps and raw values, and the
// components format them here, at render time, in the active language.
//
// Relative times deliberately use Intl.RelativeTimeFormat rather than
// hand-rolled `${n} days ago`. Arabic has six plural categories and i18next's
// count suffixes only cover two; Intl gets it right for free.

import i18n from "@/components/shared/i18n";

const EMPTY = "—";
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** The locale every Intl formatter in the admin area should use. */
export const activeLocale = () =>
  i18n.language?.startsWith("ar") ? "ar" : "en";

const translate = (key) => i18n.t(key, { ns: "common" });

const ADMIN_VALUE_LABEL_KEYS = {
  admin: "ui.adminEnums.roles.admin",
  administrator: "ui.adminEnums.roles.admin",
  "super-admin": "ui.adminEnums.roles.admin",
  candidate: "ui.adminEnums.roles.candidate",
  recruiter: "ui.adminEnums.roles.recruiter",
  active: "ui.adminEnums.userStatus.active",
  open: "ui.adminEnums.jobStatus.active",
  published: "ui.adminEnums.jobStatus.active",
  inactive: "ui.adminEnums.userStatus.inactive",
  suspended: "ui.adminEnums.userStatus.suspended",
  draft: "ui.adminEnums.jobStatus.draft",
  expired: "ui.adminEnums.jobStatus.expired",
  closed: "ui.adminEnums.jobStatus.closed",
  archived: "ui.adminEnums.jobStatus.closed",
  verified: "ui.adminEnums.companyStatus.verified",
  approved: "ui.adminEnums.companyStatus.verified",
  accepted: "ui.adminEnums.companyStatus.verified",
  pending: "ui.adminEnums.companyStatus.pending",
  "not-verified": "ui.adminEnums.companyStatus.not-verified",
  unverified: "ui.adminEnums.companyStatus.not-verified",
  rejected: "ui.adminEnums.appStatus.rejected",
  submitted: "ui.adminEnums.appStatus.submitted",
  review: "ui.adminEnums.appStatus.review",
  "in-review": "ui.adminEnums.appStatus.review",
  offer: "ui.adminEnums.appStatus.offer",
  remote: "ui.jobPickers.location.remote",
  hybrid: "ui.jobPickers.location.hybrid",
  onsite: "ui.jobPickers.location.onsite",
  "on-site": "ui.jobPickers.location.onsite",
  "full-time": "ui.jobPickers.type.fullTime",
  fulltime: "ui.jobPickers.type.fullTime",
  "part-time": "ui.jobPickers.type.partTime",
  parttime: "ui.jobPickers.type.partTime",
  contract: "ui.jobPickers.type.contract",
  internship: "ui.jobPickers.type.internship",
  "entry-level": "ui.jobPickers.level.entry",
  junior: "ui.locationWork.junior",
  "mid-level": "ui.jobPickers.level.mid",
  "senior-level": "ui.jobPickers.level.senior",
  senior: "ui.jobPickers.level.senior",
  lead: "ui.jobPickers.level.lead",
  "lead-principal": "ui.jobPickers.level.lead",
  principal: "ui.jobPickers.level.lead",
  internal: "ui.jobSources.internal",
  external: "ui.jobSources.external",
  "matchin-feed": "ui.jobSources.internal",
  linkedin: "ui.jobSources.linkedin",
  indeed: "ui.jobSources.indeed",
  referral: "ui.jobSources.referral",
  untitled: "ui.adminEnums.defaults.untitled",
  "untitled-job": "ui.adminEnums.defaults.untitledJob",
  en: "ui.adminEnums.languages.en",
  english: "ui.adminEnums.languages.en",
  ar: "ui.adminEnums.languages.ar",
  arabic: "ui.adminEnums.languages.ar",
  "email-password": "ui.adminEnums.authProviders.emailPassword",
  google: "ui.adminEnums.authProviders.google",
  github: "ui.adminEnums.authProviders.github",
  uploaded: "ui.adminEnums.cvStatus.uploaded",
  missing: "ui.adminEnums.cvStatus.missing",
  yes: "ui.jobApplication.yes",
  no: "ui.jobApplication.no",
};

const adminToken = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_/]+/g, "-")
    .replace(/-+/g, "-");

/** Localizes known backend enums while preserving unknown/free-form data. */
export function translateAdminValue(value) {
  const key = ADMIN_VALUE_LABEL_KEYS[adminToken(value)];
  return key ? translate(key) : (value ?? EMPTY);
}

const AUDIT_ACTION_KEYS = {
  verified: "ui.adminEnums.auditActions.verified",
  updated: "ui.adminEnums.auditActions.updated",
  rejected: "ui.adminEnums.auditActions.rejected",
  created: "ui.adminEnums.auditActions.created",
  status: "ui.adminEnums.auditActions.status",
  login: "ui.adminEnums.auditActions.login",
  deleted: "ui.adminEnums.auditActions.deleted",
  merged: "ui.adminEnums.auditActions.merged",
};

/** Translates an audit event category without translating its free-form data. */
export function translateAdminAuditAction(action, actionType) {
  let type = actionType;
  const value = String(action ?? "").toLowerCase();
  if (/delet|remove/.test(value)) type = "deleted";
  else if (/merge/.test(value)) type = "merged";
  if (!type) {
    if (/verif|approv|accept/.test(value)) type = "verified";
    else if (/reject|denied|delet/.test(value)) type = "rejected";
    else if (/creat|regist|add/.test(value)) type = "created";
    else if (/stat|publish|suspend|archiv/.test(value)) type = "status";
    else if (/login|logout|auth/.test(value)) type = "login";
    else if (/updat|edit|merge/.test(value)) type = "updated";
  }
  const key = AUDIT_ACTION_KEYS[type];
  return key ? translate(key) : translateAdminValue(action);
}

/** Translates common audit entity/model names; unknown entities stay as sent. */
export function translateAdminEntity(value) {
  const token = adminToken(value).replace(/-/g, "");
  let entity;
  if (/compan|organi|employer|business|agency/.test(token)) entity = "company";
  else if (/job|post/.test(token)) entity = "job";
  else if (/application/.test(token)) entity = "application";
  else if (/user|candidate|recruiter|admin/.test(token)) entity = "user";
  else if (/record/.test(token)) entity = "record";
  return entity
    ? translate(`ui.adminEnums.entities.${entity}`)
    : (value ?? EMPTY);
}

/**
 * Both formatters below are defensive because the server may legitimately omit
 * created_at / updated_at on a partially-hydrated record (e.g. a company
 * created by a queued job before its timestamps are written).
 */
function parseDate(value) {
  if (!value) return null;
  // Date-only strings ("2026-09-22") are parsed at midday so a timezone west
  // of UTC can't shift them into the previous day.
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value.slice(0, 10)}T12:00:00`
      : value,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Sep 15, 2026" — the long form used by the company and user detail screens. */
export function formatDate(value) {
  const date = parseDate(value);
  if (!date) return EMPTY;

  return new Intl.DateTimeFormat(activeLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Locale-aware date and time for audit records. */
export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return EMPTY;

  return new Intl.DateTimeFormat(activeLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** "Sep 15" — the compact form the job table shows. */
export function formatDayMonth(value) {
  const date = parseDate(value);
  if (!date) return EMPTY;

  return new Intl.DateTimeFormat(activeLocale(), {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Whole days since a timestamp; null when the date is absent or unparseable. */
export function daysSince(value) {
  const date = parseDate(value);
  if (!date) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
}

const relative = (value, unit) =>
  new Intl.RelativeTimeFormat(activeLocale(), { numeric: "always" }).format(
    -value,
    unit,
  );

/**
 * "Today" / "Yesterday" / "3 days ago" — the muted line under a company date.
 * Today and Yesterday keep their own keys because Intl has no exact equivalent
 * in every locale.
 */
export function relativeDayLabel(value) {
  const days = daysSince(value);
  if (days === null) return EMPTY;
  if (days <= 0) return translate("ui.adminDates.today");
  if (days === 1) return translate("ui.adminDates.yesterday");

  return relative(days, "day");
}

/**
 * "Never" / "Just now" / "4 hrs ago" — the muted line under a user activity
 * date. Stops at days because the user table has a date column beside it; the
 * company screens use relativeDayLabel for the longer ranges.
 */
export function relativeActivityLabel(value) {
  const date = parseDate(value);
  if (!date) return value ? EMPTY : translate("ui.adminDates.never");

  const elapsed = Date.now() - date.getTime();
  const days = Math.floor(elapsed / DAY_MS);
  if (days >= 1) return relative(days, "day");

  const hours = Math.floor(elapsed / HOUR_MS);
  if (hours >= 1) return relative(hours, "hour");

  return translate("ui.adminDates.justNow");
}

/**
 * "Fresh · 3 days ago" / "Stale · 40 days ago" — mirrors the wording the
 * freshness pill expects.
 *
 * daysSince() returns *days*; an earlier version named the result `hours` and
 * printed it with an "h", so a job published two days ago read "2h ago" while
 * the badge beside it coloured it amber for being stale.
 */
export function freshnessLabel(publishedAt, status) {
  if (!publishedAt) {
    return status === "draft" ? translate("ui.adminDates.notPublished") : EMPTY;
  }

  const days = Math.floor(daysSince(publishedAt));
  const qualifier = translate(
    days <= 7 ? "ui.adminDates.fresh" : "ui.adminDates.stale",
  );

  if (days < 1) return `${qualifier} · ${translate("ui.adminDates.justNow")}`;

  return `${qualifier} · ${relative(days, "day")}`;
}

/**
 * Compact relative time for the dashboard's activity feeds: seconds through
 * days, falling back to a short date past a week. Unlike relativeDayLabel this
 * reaches into minutes, because a feed that only said "0 days ago" for a
 * two-minute-old event tells an admin nothing.
 */
export function relativeShortLabel(value) {
  const date = parseDate(value);
  if (!date) return null;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return translate("ui.adminDates.justNow");

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return relative(minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative(hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 7) return relative(days, "day");

  return new Intl.DateTimeFormat(activeLocale(), {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Grouped number formatting, locale-aware (Arabic-Indic digits in `ar`). */
export function formatCount(value) {
  return new Intl.NumberFormat(activeLocale()).format(value ?? 0);
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
