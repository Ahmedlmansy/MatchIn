// src/features/admin/constants/admin.query-keys.js
// One query-key factory per domain (convention §4.1). Every admin query hangs
// off adminKeys so invalidation can target a whole slice of the admin area
// without touching unrelated domains.
//
// Query keys are plain nested arrays — react-query hashes them structurally,
// so no `as const` is needed (this is a .js project, not TS).
//
// Every list key is namespaced ("admin","jobs","list", filters) rather than
// sitting directly under the resource. That matters for invalidation: a bare
// ["admin","jobs"] prefix would otherwise also match a detail key whose id
// happened to equal a filters object, and ["admin","jobs",{}] (the
// no-filters list) would NOT match ["admin","jobs",{status:"pending"}] — so a
// write while a filter was active would silently leave the screen stale.

import { pruneParams } from "@/features/admin/api/normalize";

export const adminKeys = {
  all: ["admin"],

  dashboard: () => [...adminKeys.all, "dashboard"],

  jobs: (filters) => [...adminKeys.all, "jobs", "list", pruneParams(filters)],
  job: (id) => [...adminKeys.all, "jobs", "detail", String(id)],
  jobsRoot: () => [...adminKeys.all, "jobs"],

  companies: (filters) => [...adminKeys.all, "companies", "list", pruneParams(filters)],
  company: (id) => [...adminKeys.all, "companies", "detail", String(id)],
  companiesRoot: () => [...adminKeys.all, "companies"],

  users: (filters) => [...adminKeys.all, "users", "list", pruneParams(filters)],
  user: (id) => [...adminKeys.all, "users", "detail", String(id)],
  usersRoot: () => [...adminKeys.all, "users"],

  auditLogs: (filters) => [...adminKeys.all, "audit-logs", "list", pruneParams(filters)],
  auditLog: (id) => [...adminKeys.all, "audit-logs", "detail", String(id)],
  auditLogsRoot: () => [...adminKeys.all, "audit-logs"],
};

/**
 * Cache slices to invalidate after a write.
 *
 * These are the *resource roots*, never a specific list key: a write must
 * refresh every filtered/sorted/paged variant of that list, not just the one
 * the current screen happened to request.
 */
export const adminInvalidation = {
  dashboard: () => adminKeys.dashboard(),
  jobs: () => adminKeys.jobsRoot(),
  companies: () => adminKeys.companiesRoot(),
  users: () => adminKeys.usersRoot(),
  auditLogs: () => adminKeys.auditLogsRoot(),
};