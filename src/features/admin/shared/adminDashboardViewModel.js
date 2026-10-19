// src/features/admin/shared/adminDashboardViewModel.js
//
// Turns the normalized domain shape from normalizeAdminDashboard() into the
// exact props <StatCard /> and <ListItem /> expect. This lives in shared/ rather
// than api/ on purpose: picking a lucide icon and a Tailwind class is
// presentation, and api/ stays a pure request module.
//
// The components take `icon` as a component reference and `title`/`meta` as
// segment arrays — none of which the server can send — so this is the one place
// that knows how domain data becomes view data.
//
// Copy is resolved here rather than passed down as label keys. This is a view
// model, not a component tree: the cards and lists stay dumb, and there is
// exactly one place where a piece of overview copy can be worded. i18n lives in
// shared/, never in api/.

import i18n from "@/components/shared/i18n";
import {
  formatCount,
  relativeShortLabel,
  translateAdminValue,
} from "@/features/admin/shared/formatting/locale";

import {
  Building2,
  Clock,
  Briefcase,
  FileCheck,
  Users,
  CheckCircle2,
  UserPlus,
  XCircle,
  Lock,
  LogOut,
  Trash2,
  Sliders,
  CircleDot,
} from "lucide-react";

const KEY = "pages.admin.overview";
const t = (key, values) => i18n.t(key, { ns: "dashboard", ...values });

// Keyed by the same id buildOverviewStats emits — a mismatch here silently
// yields `icon: undefined`, which React reports as an invalid element type
// rather than a missing-icon warning.
const STAT_STYLE = {
  companies: { icon: Building2, iconClass: "bg-primary/10 text-primary" },
  "pending-companies": {
    icon: Clock,
    iconClass: "bg-secondary/12 text-secondary",
  },
  jobs: { icon: Briefcase, iconClass: "bg-warning/14 text-warning" },
  applications: { icon: FileCheck, iconClass: "bg-success/12 text-success" },
  users: { icon: Users, iconClass: "bg-muted/12 text-muted" },
};

const trend = (value) =>
  value
    ? {
        type: value > 0 ? "up" : "neutral",
        label: `${value > 0 ? "+" : ""}${value}%`,
      }
    : null;

// Counts are rendered with their unit already chosen by the caller's key, so no
// pluralisation happens here — these are adjectives ("132 active"), not nouns.
const count = formatCount;

/**
 * Builds the five overview stat cards. A card is dropped only when the server
 * sent no number at all for it, so a partial payload still renders the rest
 * instead of showing fabricated zeros.
 */
export function buildOverviewStats(stats = {}) {
  const cards = [
    {
      id: "companies",
      value: count(stats.companies?.total),
      label: t(`${KEY}.stats.companies`),
      sublabel:
        stats.companies?.active || stats.companies?.inactive
          ? t(`${KEY}.statSubs.companies`, {
              active: count(stats.companies.active),
              inactive: count(stats.companies.inactive),
            })
          : null,
      trend: trend(stats.companies?.trend),
    },
    {
      id: "pending-companies",
      value: count(stats.pendingCompanies?.total),
      label: t(`${KEY}.stats.pendingCompanies`),
      sublabel: stats.pendingCompanies?.submittedToday
        ? t(`${KEY}.statSubs.submittedToday`, {
            count: count(stats.pendingCompanies.submittedToday),
          })
        : null,
      trend: null,
    },
    {
      id: "jobs",
      value: count(stats.jobs?.total),
      label: t(`${KEY}.stats.jobs`),
      sublabel:
        stats.jobs?.open || stats.jobs?.closed
          ? t(`${KEY}.statSubs.jobs`, {
              open: count(stats.jobs.open),
              closed: count(stats.jobs.closed),
            })
          : null,
      trend: trend(stats.jobs?.trend),
    },
    {
      id: "applications",
      value: count(stats.applications?.total),
      label: t(`${KEY}.stats.applications`),
      sublabel: stats.applications?.thisWeek
        ? t(`${KEY}.statSubs.applications`, {
            count: count(stats.applications.thisWeek),
          })
        : null,
      trend: trend(stats.applications?.trend),
    },
    {
      id: "users",
      value: count(stats.users?.total),
      label: t(`${KEY}.stats.users`),
      sublabel: t(`${KEY}.statSubs.users`),
      trend: trend(stats.users?.trend),
    },
  ];

  return cards
    .filter((card) => card.value !== "0" || card.sublabel || card.trend)
    .map((card) => ({ ...card, ...STAT_STYLE[card.id] }));
}

// --- activity / audit list rows -------------------------------------------

// `badgeKey` resolves under pages.admin.overview.badges. A server-supplied
// `entry.status` still wins over it, because that is real data rather than our
// guess from a regex on the event name.
const ACTIVITY_VISUALS = [
  {
    match: /approv/i,
    icon: CheckCircle2,
    iconClass: "bg-success/12 text-success",
    badgeKey: "approved",
    badgeClass: "bg-success/12 text-success",
  },
  {
    match: /submitt|pend|review/i,
    icon: Clock,
    iconClass: "bg-warning/14 text-warning",
    badgeKey: "pending",
    badgeClass: "bg-warning/14 text-warning",
  },
  {
    match: /suspend|reject|cancel/i,
    icon: XCircle,
    iconClass: "bg-secondary/12 text-secondary",
    badgeKey: "suspended",
    badgeClass: "bg-secondary/12 text-secondary",
  },
  {
    match: /user|register|signup/i,
    icon: UserPlus,
    iconClass: "bg-primary/10 text-primary",
    badgeKey: "user",
    badgeClass: "bg-muted/10 text-muted",
  },
  {
    match: /job|post/i,
    icon: Briefcase,
    iconClass: "bg-warning/14 text-warning",
    badgeKey: "job",
    badgeClass: "bg-primary/10 text-primary",
  },
];

const AUDIT_VISUALS = [
  {
    match: /login|logout|auth/i,
    icon: LogOut,
    iconClass: "bg-muted/10 text-muted",
    badgeKey: "auth",
    badgeClass: "bg-muted/10 text-muted",
  },
  {
    match: /delete|remove/i,
    icon: Trash2,
    iconClass: "bg-secondary/12 text-secondary",
    badgeKey: "delete",
    badgeClass: "bg-secondary/12 text-secondary",
  },
  {
    match: /role|permission/i,
    icon: Lock,
    iconClass: "bg-primary/10 text-primary",
    badgeKey: "permission",
    badgeClass: "bg-primary/10 text-primary",
  },
  {
    match: /status|approv|activ/i,
    icon: CheckCircle2,
    iconClass: "bg-success/12 text-success",
    badgeKey: "status",
    badgeClass: "bg-success/12 text-success",
  },
  {
    match: /setting|config/i,
    icon: Sliders,
    iconClass: "bg-secondary/12 text-secondary",
    badgeKey: "config",
    badgeClass: "bg-warning/14 text-warning",
  },
];

const FALLBACK = {
  activity: { icon: CircleDot, iconClass: "bg-primary/10 text-primary" },
  audit: { icon: Lock, iconClass: "bg-primary/10 text-primary" },
};

// The title is a segment array so ListItem can mix plain text with links.
function buildTitle(entry) {
  const title = entry.title || entry.type;
  if (!entry.href) return [title];
  const words = String(title).trim().split(/\s+/);
  if (words.length <= 1) return [{ text: title, href: entry.href }];
  const last = words.pop();
  return [`${words.join(" ")} `, { text: last, href: entry.href }];
}

function buildRow(entry, visuals, kind) {
  const haystack = `${entry.type} ${entry.title}`;
  const visual = visuals.find((v) => v.match.test(haystack)) ?? FALLBACK[kind];
  const badgeLabel = entry.status
    ? translateAdminValue(entry.status)
    : t(`${KEY}.badges.${visual.badgeKey}`);

  const meta = [
    ...(badgeLabel
      ? [{ type: "badge", label: badgeLabel, className: visual.badgeClass }]
      : []),
  ];

  const when = relativeShortLabel(entry.createdAt);
  if (when) meta.push({ type: "text", text: when });
  if (entry.actorName) {
    if (meta.length) meta.push({ type: "dot" });
    meta.push({
      type: "text",
      text: t(`${KEY}.by`, { name: entry.actorName }),
    });
  }
  // ListItem needs at least one meta token to keep its layout height.
  if (!meta.length) meta.push({ type: "text", text: "—" });

  return {
    id: entry.id,
    icon: visual.icon,
    iconClass: visual.iconClass,
    title: buildTitle(entry),
    meta,
  };
}

export function buildRecentActivity(entries = []) {
  return entries.map((entry) => buildRow(entry, ACTIVITY_VISUALS, "activity"));
}

export function buildAuditLogs(entries = []) {
  return entries.map((entry) => buildRow(entry, AUDIT_VISUALS, "audit"));
}
