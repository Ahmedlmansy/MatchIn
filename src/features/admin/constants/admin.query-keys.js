// src/features/admin/constants/admin.query-keys.js
// One query-key factory per domain (convention §4.1). Every admin query hangs
// off adminKeys so invalidation can target a whole slice of the admin area
// without touching unrelated domains.
//
// Query keys are plain nested arrays — react-query hashes them structurally,
// so no `as const` is needed (this is a .js project, not TS).

export const adminKeys = {
  all: ["admin"],

  dashboard: () => [...adminKeys.all, "dashboard"],

  // Placeholders for the rest of the admin domain, added as each screen is
  // migrated off its mock data — keeps every key defined in exactly one place.
  companies: (filters) => [...adminKeys.all, "companies", filters ?? {}],
  company: (id) => [...adminKeys.all, "companies", String(id)],
  users: (filters) => [...adminKeys.all, "users", filters ?? {}],
  user: (id) => [...adminKeys.all, "users", String(id)],
  jobs: (filters) => [...adminKeys.all, "jobs", filters ?? {}],
  job: (id) => [...adminKeys.all, "jobs", String(id)],
  auditLogs: (filters) => [...adminKeys.all, "audit-logs", filters ?? {}],
  auditLog: (id) => [...adminKeys.all, "audit-logs", String(id)],
};