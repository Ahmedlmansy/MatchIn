// src/features/admin/api/admin.api.js
//
// GET /api/admin/dashboard — the admin-only overview payload.
//
// This is the one admin screen that was already integrated, so its normalizer
// is the reference implementation: tolerant (every field read through an alias
// list) and complete (no component ever reads the raw server response).
// convention §4.5

import { api } from "@/services/axios/axiosInstance";
import { unwrap, pick, toNumber, toList } from "./normalize";

/** GET /api/admin/dashboard */
export const fetchAdminDashboardRequest = () =>
  api.get("/api/admin/dashboard").then(unwrap);

const normalizeCounter = (raw, aliases) => {
  const source = typeof raw === "object" && raw !== null ? raw : {};
  const total = toNumber(pick(source, [...aliases.total, "count", "value"]));
  const extra = {};
  for (const [field, keys] of Object.entries(aliases.extra ?? {})) {
    extra[field] = toNumber(pick(source, keys));
  }
  return { total, ...extra };
};

const normalizeEntry = (raw, index, prefix) => ({
  id: String(pick(raw, ["id", "uuid", "key"], `${prefix}-${index}`)),
  type: pick(raw, ["type", "event", "action", "action_type", "event_type"], "unknown"),
  title: pick(raw, ["title", "description", "message", "summary"], ""),
  actorName: pick(
    raw,
    ["actor_name", "actorName", "admin_name", "user_name", "performed_by", "actor"],
    null,
  ),
  status: pick(raw, ["status", "status_label", "state"], null),
  href: pick(raw, ["href", "url", "link"], null),
  createdAt: pick(raw, ["created_at", "createdAt", "timestamp", "occurred_at", "date"], null),
});

/**
 * Normalizes the dashboard into one stable domain shape:
 *   { stats, recentActivity: [...], auditLogs: [...] }
 * so the view model and components never branch on server naming.
 */
export function normalizeAdminDashboard(raw) {
  const body = unwrap(raw) ?? {};

  // Counters may sit under a stats object or be flattened onto the root.
  const statsSource = pick(body, ["stats", "statistics", "overview", "counters", "metrics"], body);

  const stats = {
    companies: normalizeCounter(pick(statsSource, ["companies", "total_companies"]), {
      total: ["total", "count", "all"],
      extra: {
        active: ["active", "active_companies", "approved"],
        inactive: ["inactive", "inactive_companies", "suspended"],
        trend: ["trend", "trend_percent", "growth", "change", "percentage_change"],
      },
    }),
    pendingCompanies: normalizeCounter(
      pick(statsSource, ["pending_companies", "pendingCompanies", "pending"]),
      {
        total: ["total", "count", "all"],
        extra: { submittedToday: ["submitted_today", "submittedToday", "today"] },
      },
    ),
    jobs: normalizeCounter(pick(statsSource, ["jobs"]), {
      total: ["total", "count", "all"],
      extra: {
        open: ["open", "active", "published"],
        closed: ["closed", "expired", "archived"],
        trend: ["trend", "trend_percent", "growth", "change", "percentage_change"],
      },
    }),
    applications: normalizeCounter(pick(statsSource, ["applications", "applies"]), {
      total: ["total", "count", "all"],
      extra: {
        thisWeek: ["this_week", "thisWeek", "week", "weekly"],
        trend: ["trend", "trend_percent", "growth", "change", "percentage_change"],
      },
    }),
    users: normalizeCounter(pick(statsSource, ["users", "candidates"]), {
      total: ["total", "count", "all"],
      extra: { trend: ["trend", "trend_percent", "growth", "change", "percentage_change"] },
    }),
  };

  return {
    stats,
    recentActivity: toList(
      pick(body, ["recent_activity", "recentActivity", "activity", "activities", "recent_activities"]),
    ).map((item, i) => normalizeEntry(item, i, "activity")),
    auditLogs: toList(
      pick(body, ["audit_logs", "auditLogs", "audits", "logs", "recent_audit_logs"]),
    ).map((item, i) => normalizeEntry(item, i, "audit")),
  };
}