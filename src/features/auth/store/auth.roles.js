// src/features/auth/store/auth.roles.js
//
// The ONE place that answers "is this account an administrator?".
//
// This existed in three mutually incompatible forms and every one of them
// disagreed with another:
//
//   DashboardRoleTree  →  role === "super_admin"   ? admin tree : candidate tree
//   Sidebar            →  role === "admin"        ? admin tree : candidate tree
//   admin-users.api    →  normalizes super_admin/superadmin to "admin"
//
// Consequence: an account with role "admin" got the *candidate* route tree
// (because only the exact string "super_admin" selected the admin tree) while
// simultaneously getting the *admin* sidebar. An account with role
// "super_admin" got the admin tree and the candidate sidebar. There was no role
// value for which all three agreed.
//
// Every caller now goes through isAdminRole().

/** Role strings the backend may use for a staff/administrator account. */
export const ADMIN_ROLES = ["super_admin", "superadmin", "admin", "administrator"];

const ADMIN_SET = new Set(ADMIN_ROLES);

/**
 * True when the role grants access to the admin workspace.
 *
 * Accepts a role string or a whole user object, because call sites have one or
 * the other depending on whether they already have the user in hand.
 * Missing/unknown roles return false — an unknown role must never be granted
 * admin access.
 */
export function isAdminRole(roleOrUser) {
  if (!roleOrUser) return false;

  const role =
    typeof roleOrUser === "string" ? roleOrUser : roleOrUser.role ?? roleOrUser.user_type;

  if (!role) return false;
  return ADMIN_SET.has(String(role).toLowerCase());
}

/**
 * The canonical role for display and for the admin user-management filters.
 * Every admin-ish spelling collapses to "admin"; the candidate role stays
 * "candidate" so the existing candidate-only guards keep working.
 */
export function normalizeRole(role) {
  const value = String(role ?? "").toLowerCase();
  return isAdminRole(value) ? "admin" : value || null;
}

/**
 * True only for genuine candidate accounts.
 *
 * The counterpart to isAdminRole, and deliberately strict: anything that is an
 * admin, a recruiter, or an unrecognised role is NOT a candidate. That
 * direction matters because this guard is what stops a staff account being
 * bounced into the candidate onboarding form.
 */
export function isCandidateRole(role) {
  if (!role) return false;
  if (isAdminRole(role)) return false;
  return String(role).toLowerCase() === "candidate";
}