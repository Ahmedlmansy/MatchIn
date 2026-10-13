// src/features/admin/api/admin-audit-logs.api.js
//
// GET /api/admin/audit-logs
//
// Audit logs are an immutable record: the backend exposes read endpoints only,
// so this module has no mutations by design.

import { api } from "@/services/axios/axiosInstance";
import { Briefcase, Building2 } from "lucide-react";
import {
  pick,
  toList,
  toText,
  toId,
  normalizePaginated,
} from "./normalize";
import { initialsOf } from "./admin-jobs.api";

const avatarClassFor = (seed = "") => {
  const key = String(seed);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i)) % 997;
  return ["bg-primary", "bg-secondary", "bg-[#3d6b8a]", "bg-[#5a6b4f]", "bg-[#6b4f6b]"][
    hash % 5
  ];
};

/**
 * Classifies an action string into the badge tone the <Badge /> component
 * already knows: verified | updated | rejected | created | status | login.
 * Kept here so the table and the details screen always agree on the colour.
 */
export function actionBadgeType(action = "", eventType = "") {
  const haystack = `${eventType} ${action}`.toLowerCase();
  if (/verif|approv|accept/.test(haystack)) return "verified";
  if (/reject|denied|delet/.test(haystack)) return "rejected";
  if (/creat|regist|add/.test(haystack)) return "created";
  if (/stat|publish|suspend|archiv/.test(haystack)) return "status";
  if (/login|logout|auth/.test(haystack)) return "login";
  if (/updat|edit|merge/.test(haystack)) return "updated";
  return "updated";
}

/** Human-readable action label; falls back to the raw event type. */
function actionLabel(raw) {
  return toText(pick(raw, ["action", "description", "event", "event_type", "type"])) ?? "—";
}

/** Audit row -> the shape <AuditLogRow /> renders. */
export function normalizeAuditLog(raw) {
  const actor = pick(raw, ["actor", "user", "performed_by", "admin"], {}) ?? {};
  const actorName =
    toText(pick(actor, ["name", "full_name", "fullName"])) ??
    toText(pick(raw, ["actor_name", "actorName"])) ??
    "System";
  const id = toId(pick(raw, ["id", "uuid"]), "");
  const createdAt = pick(raw, ["created_at", "createdAt", "occurred_at", "timestamp"]);

  return {
    id,
    action: actionLabel(raw),
    actionType: actionBadgeType(actionLabel(raw), toText(pick(raw, ["event_type", "eventType"]))),
    actor: actorName,
    role: toText(pick(actor, ["role", "role_label"])) ?? "—",
    initials: initialsOf(actorName) || "SY",
    avatarClass: avatarClassFor(actorName),
    entity: toText(pick(raw, ["entity_type", "entityType", "model", "subject_type"])) ?? "—",
    entityId: toId(pick(raw, ["entity_id", "entityId", "model_id"]), "—"),
    entityTitle: toText(pick(raw, ["entity_title", "subject"])),
    // `prev` / `newValue` are the names the table columns and the drawer
    // read. They are produced here so no component has to know that the
    // backend calls them old_value / new_value.
    prev: toText(pick(raw, ["old_value", "previous_value", "old", "previous"])),
    newValue: toText(pick(raw, ["new_value", "new", "after"])),
    ip: toText(pick(raw, ["ip_address", "ip", "meta.ip"])) ?? "—",
    time: toText(pick(raw, ["time", "created_at", "createdAt"])) ?? "—",
    relative: toText(pick(raw, ["relative", "human_time"])) ?? "—",
    createdAt,
    raw: raw,
  };
}

/**
 * GET /api/admin/audit-logs?search=&action=&entity=&actor=&sort=&page=
 */
export const fetchAdminAuditLogsRequest = async (filters = {}) => {
  const response = await api.get("/api/admin/audit-logs", { params: filters });
  const { items, ...meta } = normalizePaginated(response, { perPage: 10 });
  return { items: items.map(normalizeAuditLog), ...meta };
};

/**
 * Detail shape for the audit-log detail screen.
 *
 * The backend exposes only the list endpoint, so the row's `raw` payload is
 * used as the detail body rather than inventing a second fetch.
 */
export function normalizeAuditLogDetail(raw) {
  const base = normalizeAuditLog(raw);
  const previousData = pick(raw, ["old_values", "old_value", "previous"]);
  const nextData = pick(raw, ["new_values", "new_value", "next"]);

  return {
    ...base,
    previousData: previousData ?? {},
    nextData: nextData ?? {},
    changes: fieldChanges(previousData, nextData),
    related: relatedEntitiesFrom(base),
  };
}

/**
 * Derives per-field before/after rows by diffing the two payload objects.
 * This is the one piece of "logic" the details screen needs and the server
 * does not provide, so it is computed once here rather than in the component.
 */
function fieldChanges(previous, next) {
  if (!previous || !next) return [];
  if (typeof previous !== "object" || typeof next !== "object") return [];

  const fields = new Set([...Object.keys(previous), ...Object.keys(next)]);
  return [...fields]
    .filter((field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]))
    .map((field) => ({
      field,
      from: String(previous[field] ?? "—"),
      to: String(next[field] ?? "—"),
    }));
}

/**
 * Related-entity cards for the details screen.
 *
 * The backend may supply an explicit `related` array; when it does we use it
 * verbatim. Otherwise the log's own subject is the one related record, so the
 * section renders the job or company this log acted on rather than nothing.
 */
export function relatedEntitiesFrom(log) {
  const supplied = toList(log?.raw?.related ?? log?.raw?.related_entities);
  const source = supplied.length
    ? supplied
    : [{ id: log.entityId, type: log.entity, title: log.entityTitle ?? log.entity, href: null }];

  return source.map((entity, index) => {
    const type = String(toText(pick(entity, ["label", "type"])) ?? log.entity ?? "").toLowerCase();
    const isJob = /job|post/.test(type);

    return {
      id: toId(pick(entity, ["id"]), `related-${index}`),
      label: toText(pick(entity, ["label", "type"])) ?? (isJob ? "Related Job" : "Related Record"),
      title: toText(pick(entity, ["title", "name"])) ?? "—",
      meta: toId(pick(entity, ["meta", "id"]), log.entityId ?? ""),
      href: toText(pick(entity, ["href", "url"])) ?? "#",
      icon: isJob ? Briefcase : Building2,
      iconClass: isJob ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary",
    };
  });
}