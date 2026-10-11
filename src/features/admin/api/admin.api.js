import { api } from "@/services/axios/axiosInstance";

// GET /api/admin/dashboard — admin-only overview payload.
export const fetchAdminDashboardRequest = () =>
  api.get("/api/admin/dashboard").then((res) => res.data?.data ?? res.data);

/**
 * Normalizes GET /api/admin/dashboard into one stable domain shape, so no
 * component ever reads the raw server response (convention §4.5).
 *
 * Tolerant by design: Laravel resources commonly nest the counters under
 * `stats`/`statistics` and use snake_case, while some deployments flatten them
 * and return camelCase. Every field is read through `pick()` with an explicit
 * alias list, so a different-but-equivalent backend shape only needs an alias
 * added here — never a change to a component or the hook.
 *
 * Input:  the raw response body.
 * Output: {
 *   stats: { companies, pendingCompanies, jobs, applications, users },
 *   recentActivity: [{ id, type, title, actorName, status, href, createdAt }],
 *   auditLogs:       [{ id, type, title, actorName, status, createdAt }],
 * }
 */

const pick = (obj, keys, fallback = undefined) => {
  if (!obj || typeof obj !== "object") return fallback;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
};

// Numbers arrive as numbers or numeric strings depending on the serializer.
const num = (value, fallback = 0) => {
  const parsed = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value) => (Array.isArray(value) ? value : []);

const normalizeCounter = (raw, aliases) => {
  const source = typeof raw === "object" && raw !== null ? raw : {};
  const total = num(pick(source, [...aliases.total, "count", "value"]));
  const extra = {};
  for (const [field, keys] of Object.entries(aliases.extra ?? {})) {
    extra[field] = num(pick(source, keys));
  }
  return { total, ...extra };
};

// A trend is a percentage change the server already computed; we only shape it.
const normalizeTrend = (raw) => {
  const value = num(raw);
  if (!Number.isFinite(value) || value === 0) return null;
  return {
    type: value > 0 ? "up" : "neutral",
    label: `${value > 0 ? "+" : ""}${value}%`,
  };
};

const normalizeEntry = (raw, index, prefix) => ({
  id: String(pick(raw, ["id", "uuid", "key"], `${prefix}-${index}`)),
  type: pick(raw, ["type", "event", "action", "action_type", "event_type"], "unknown"),
  title: pick(raw, ["title", "description", "message", "summary"], ""),
  actorName: pick(raw, ["actor_name", "actorName", "admin_name", "user_name", "performed_by", "actor"], null),
  status: pick(raw, ["status", "status_label", "state"], null),
  href: pick(raw, ["href", "url", "link"], null),
  createdAt: pick(raw, ["created_at", "createdAt", "timestamp", "occurred_at", "date"], null),
});

export function normalizeAdminDashboard(raw) {
  const body = raw?.data?.data ?? raw?.data ?? raw ?? {};

  // Counters may sit under a stats object or be flattened onto the root.
  const statsSource =
    pick(body, ["stats", "statistics", "overview", "counters", "metrics"], body) ?? body;

  const stats = {
    companies: normalizeCounter(pick(statsSource, ["companies", "total_companies"]), {
      total: ["total", "count", "all"],
      extra: {
        active: ["active", "active_companies", "approved"],
        inactive: ["inactive", "inactive_companies", "suspended"],
        trend: ["trend", "trend_percent", "growth", "change", "percentage_change"],
      },
    }),
    pendingCompanies: normalizeCounter(pick(statsSource, ["pending_companies", "pendingCompanies", "pending"]), {
      total: ["total", "count", "all"],
      extra: {
        submittedToday: ["submitted_today", "submittedToday", "today"],
      },
    }),
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
      extra: {
        trend: ["trend", "trend_percent", "growth", "change", "percentage_change"],
      },
    }),
  };

  // A trend is a percentage, so it stays a number here; the view model decides
  // how to present it.
  stats.companies.trend = num(stats.companies.trend, 0);
  stats.jobs.trend = num(stats.jobs.trend, 0);
  stats.applications.trend = num(stats.applications.trend, 0);
  stats.users.trend = num(stats.users.trend, 0);

  return {
    stats,
    recentActivity: list(
      pick(body, ["recent_activity", "recentActivity", "activity", "activities", "recent_activities"]),
    ).map((item, i) => normalizeEntry(item, i, "activity")),
    auditLogs: list(pick(body, ["audit_logs", "auditLogs", "audits", "logs", "recent_audit_logs"])).map(
      (item, i) => normalizeEntry(item, i, "audit"),
    ),
  };
}

// Kept exported for reuse by other admin list screens, not used here.
export { normalizeTrend };