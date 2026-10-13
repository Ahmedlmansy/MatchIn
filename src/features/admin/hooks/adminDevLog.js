// src/features/admin/hooks/adminDevLog.js
//
// Development-only logging for the admin data layer.
//
// ── Why this is one module instead of console.log in every hook ───────────
// Every admin read goes through useAdminQuery and every admin write through
// useAdminMutation, so logging those two functions covers all six hook files
// without duplicating a single line. When you are done debugging, deleting
// this file plus its two call sites removes the whole instrumentation.
//
// ── How to control it ─────────────────────────────────────────────────────
//   · Off entirely in production builds (import.meta.env.DEV is false there).
//   · Set VITE_ADMIN_LOG=false in .env to silence it during local dev too.
//
// Vite only exposes env vars prefixed with VITE_, and only ones present at
// dev-server start — so restart the dev server after changing it.

const ENABLED = import.meta.env.DEV && import.meta.env.VITE_ADMIN_LOG !== "false";

/**
 * Turns a react-query key into a readable name.
 *   ["admin","dashboard"]                 -> admin.dashboard
 *   ["admin","jobs","list",{…filters}]    -> admin.jobs.list
 *   ["admin","jobs","detail","5"]         -> admin.jobs.detail(5)
 *
 * Filter objects are dropped (their contents are logged separately as
 * `params`), and only a trailing id — the one that follows a "detail" marker —
 * is appended in parentheses.
 */
export function nameFromQueryKey(queryKey) {
  if (!Array.isArray(queryKey)) return "admin.query";

  const parts = queryKey.filter((part) => typeof part !== "object");
  if (parts.length <= 2) return parts.join(".") || "admin";

  const last = parts[parts.length - 1];
  const marker = parts[parts.length - 2];

  // Only a detail key carries an identifier worth showing; appending anything
  // else would just repeat a word that is already in the name.
  if (marker === "detail") return `${parts.slice(0, -1).join(".")}(${last})`;

  return parts.join(".");
}

const stamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

const emit = (method, args) => {
  if (!ENABLED) return;
  console.log(`%c[admin ${stamp()}]`, "color:#7c8aa0;font-weight:600", ...args);
};

/** A read is about to start (or is being skipped). */
export function logQueryStart(name, { params, enabled }) {
  if (!ENABLED) return;
  emit("debug", [
    `▶ ${name}`,
    enabled ? "" : "(skipped — query disabled)",
    params && Object.keys(params).length ? `params ${JSON.stringify(params)}` : "",
  ].filter(Boolean));
}

/** A read finished successfully. */
export function logQuerySuccess(name, { ms, summary }) {
  if (!ENABLED) return;
  emit("debug", [`◀ ${name} ok in ${ms}ms`, summary ?? ""].filter(Boolean));
}

/** A read failed. `status`/`message` come from normalizeApiError. */
export function logQueryError(name, { ms, status, message }) {
  if (!ENABLED) return;
  emit("error", [`✖ ${name} failed in ${ms}ms`, `status=${status ?? "-"}`, message ?? ""].filter(Boolean));
}

/** A write is about to start. */
export function logMutationStart(name, variables) {
  if (!ENABLED) return;
  const hasVars = variables !== undefined && variables !== null && Object.keys(variables ?? {}).length;
  emit("debug", [`▶ ${name}`, hasVars ? `payload ${JSON.stringify(variables)}` : ""].filter(Boolean));
}

/**
 * A write finished successfully. No duration here — onSuccess runs after the
 * invalidation round trip, so any timing measured there would include cache
 * refetches rather than the request itself.
 */
export function logMutationSuccess(name) {
  if (!ENABLED) return;
  emit("debug", [`◀ ${name} ok`]);
}

/** A write failed. */
export function logMutationError(name, { ms, status, message }) {
  if (!ENABLED) return;
  emit("error", [`✖ ${name} failed in ${ms}ms`, `status=${status ?? "-"}`, message ?? ""].filter(Boolean));
}

/** Which cache slices a successful write invalidated. */
export function logInvalidation(name, keys) {
  if (!ENABLED) return;
  emit("debug", [`↻ ${name} invalidated`, keys.length ? keys.join(", ") : ""].filter(Boolean));
}

export const adminLoggingEnabled = ENABLED;