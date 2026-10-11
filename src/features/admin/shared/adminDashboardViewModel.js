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

const fmt = new Intl.NumberFormat("en-US");

// Keyed by the same id buildOverviewStats emits — a mismatch here silently
// yields `icon: undefined`, which React reports as an invalid element type
// rather than a missing-icon warning.
const STAT_STYLE = {
  companies: { icon: Building2, iconClass: "bg-primary/10 text-primary" },
  "pending-companies": { icon: Clock, iconClass: "bg-secondary/12 text-secondary" },
  jobs: { icon: Briefcase, iconClass: "bg-warning/14 text-warning" },
  applications: { icon: FileCheck, iconClass: "bg-success/12 text-success" },
  users: { icon: Users, iconClass: "bg-muted/12 text-muted" },
};

const trend = (value) =>
  value ? { type: value > 0 ? "up" : "neutral", label: `${value > 0 ? "+" : ""}${value}%` } : null;

// Counts are rendered with their unit already chosen by the caller, so no
// pluralisation happens here — these are adjectives ("132 active"), not nouns.
const count = (n) => fmt.format(n ?? 0);

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
      label: "Companies",
      sublabel:
        stats.companies?.active || stats.companies?.inactive
          ? `${count(stats.companies.active)} active · ${count(stats.companies.inactive)} inactive`
          : null,
      trend: trend(stats.companies?.trend),
    },
    {
      id: "pending-companies",
      value: count(stats.pendingCompanies?.total),
      label: "Pending Companies",
      sublabel: stats.pendingCompanies?.submittedToday
        ? `${count(stats.pendingCompanies.submittedToday)} submitted today`
        : null,
      trend: null,
    },
    {
      id: "jobs",
      value: count(stats.jobs?.total),
      label: "Jobs",
      sublabel:
        stats.jobs?.open || stats.jobs?.closed
          ? `${count(stats.jobs.open)} open · ${count(stats.jobs.closed)} closed`
          : null,
      trend: trend(stats.jobs?.trend),
    },
    {
      id: "applications",
      value: count(stats.applications?.total),
      label: "Applications",
      sublabel: stats.applications?.thisWeek
        ? `${count(stats.applications.thisWeek)} this week`
        : null,
      trend: trend(stats.applications?.trend),
    },
    {
      id: "users",
      value: count(stats.users?.total),
      label: "Users",
      sublabel: "Candidates + Recruiters",
      trend: trend(stats.users?.trend),
    },
  ];

  return cards
    .filter((card) => card.value !== "0" || card.sublabel || card.trend)
    .map((card) => ({ ...card, ...STAT_STYLE[card.id] }));
}

// --- activity / audit list rows -------------------------------------------

const ACTIVITY_VISUALS = [
  { match: /approv/i, icon: CheckCircle2, iconClass: "bg-success/12 text-success", badge: "Approved", badgeClass: "bg-success/12 text-success" },
  { match: /submitt|pend|review/i, icon: Clock, iconClass: "bg-warning/14 text-warning", badge: "Pending", badgeClass: "bg-warning/14 text-warning" },
  { match: /suspend|reject|cancel/i, icon: XCircle, iconClass: "bg-secondary/12 text-secondary", badge: "Suspended", badgeClass: "bg-secondary/12 text-secondary" },
  { match: /user|register|signup/i, icon: UserPlus, iconClass: "bg-primary/10 text-primary", badge: "User", badgeClass: "bg-muted/10 text-muted" },
  { match: /job|post/i, icon: Briefcase, iconClass: "bg-warning/14 text-warning", badge: "Job", badgeClass: "bg-primary/10 text-primary" },
];

const AUDIT_VISUALS = [
  { match: /login|logout|auth/i, icon: LogOut, iconClass: "bg-muted/10 text-muted", badge: "Auth", badgeClass: "bg-muted/10 text-muted" },
  { match: /delete|remove/i, icon: Trash2, iconClass: "bg-secondary/12 text-secondary", badge: "Delete", badgeClass: "bg-secondary/12 text-secondary" },
  { match: /role|permission/i, icon: Lock, iconClass: "bg-primary/10 text-primary", badge: "Permission", badgeClass: "bg-primary/10 text-primary" },
  { match: /status|approv|activ/i, icon: CheckCircle2, iconClass: "bg-success/12 text-success", badge: "Status", badgeClass: "bg-success/12 text-success" },
  { match: /setting|config/i, icon: Sliders, iconClass: "bg-secondary/12 text-secondary", badge: "Config", badgeClass: "bg-warning/14 text-warning" },
];

const FALLBACK = {
  activity: { icon: CircleDot, iconClass: "bg-primary/10 text-primary" },
  audit: { icon: Lock, iconClass: "bg-primary/10 text-primary" },
};

function relativeTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
  const badgeLabel = entry.status ?? visual.badge;

  const meta = [
    ...(badgeLabel ? [{ type: "badge", label: badgeLabel, className: visual.badgeClass }] : []),
  ];

  const when = relativeTime(entry.createdAt);
  if (when) meta.push({ type: "text", text: when });
  if (entry.actorName) {
    if (meta.length) meta.push({ type: "dot" });
    meta.push({ type: "text", text: `by ${entry.actorName}` });
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