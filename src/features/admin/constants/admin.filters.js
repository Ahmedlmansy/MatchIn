// src/features/admin/constants/admin.filters.js
//
// Toolbar options for the admin list screens.
//
// These were previously mixed in with the mock datasets
// (shared/jobManagementData.js, shared/auditLogsListData.js), which made a
// file of hard-coded UI options look like fake data. They are configuration,
// not records, so they live with the other admin constants and every filter
// dropdown reads from one place.

/** --- Job Management --- */

export const JOB_STATUS_FILTER_KEYS = [
  { id: "all", labelKey: "ui.adminJobFilters.allStatuses" },
  { id: "active", labelKey: "ui.adminEnums.jobStatus.active" },
  { id: "draft", labelKey: "ui.adminEnums.jobStatus.draft" },
  { id: "expired", labelKey: "ui.adminEnums.jobStatus.expired" },
  { id: "closed", labelKey: "ui.adminEnums.jobStatus.closed" },
];

export const JOB_SOURCE_FILTER_KEYS = [
  { id: "all", labelKey: "ui.adminJobFilters.allSources" },
  { id: "internal", labelKey: "ui.jobSources.internal" },
  { id: "external", labelKey: "ui.adminJobFilters.external" },
];

export const JOB_SORT_KEYS = [
  { value: "created-desc", labelKey: "ui.adminJobSort.createdDesc" },
  { value: "published-desc", labelKey: "ui.adminJobSort.publishedDesc" },
  { value: "freshness", labelKey: "ui.adminJobSort.freshness" },
];

/**
 * Desktop column headers for the job list grid. `labelKey` follows the same
 * rule as every other localized option list: the constants module holds no
 * i18n, the toolbar resolves the key at render time.
 */
export const JOB_COLUMNS = [
  { labelKey: "ui.adminJobColumns.jobCompany", className: "col-span-4" },
  { labelKey: "ui.adminJobColumns.locationMode", className: "col-span-2" },
  { labelKey: "ui.adminJobColumns.status", className: "col-span-2" },
  { labelKey: "ui.adminJobColumns.sourceFreshness", className: "col-span-2" },
  { labelKey: "ui.adminJobColumns.dates", className: "col-span-1" },
  { labelKey: "ui.adminJobColumns.actions", className: "col-span-1 text-right" },
];

/**
 * The statuses an admin can set from either status menu.
 *
 * `value` is the API enum; `labelKey` is what the menu renders. These used to be
 * display-cased strings compared against a title-cased `job.status`, which meant
 * the wire value was recovered with `.toLowerCase()` at each call site — and that
 * a localized label would have been posted to the server as the status.
 */
export const JOB_STATUS_OPTIONS = [
  { value: "active", labelKey: "ui.adminEnums.jobStatus.active" },
  { value: "draft", labelKey: "ui.adminEnums.jobStatus.draft" },
  { value: "closed", labelKey: "ui.adminEnums.jobStatus.closed" },
];

/** --- Companies / Users ---
 *
 * The localized lists live at the bottom of this file; see the note above
 * them for why they carry `labelKey` instead of `label`.
 */

// --- Audit Logs ---
// Filter option lists are intentionally empty-value driven: the backend owns
// which actions/entities/actors exist, so these are populated from the loaded
// rows rather than hard-coded. See buildAuditFilterOptions in the page.

export const AUDIT_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "actor-az", label: "Actor A–Z" },
];

/**
 * Localized option lists (companies + users).
 *
 * These carry `labelKey` instead of `label` so the option set stays a pure data
 * structure — admin.constants is configuration, and AUTH_LOGIC_CONVENTION.md §5
 * keeps i18n out of it. The toolbar translates at render time.
 *
 * The job/audit lists above still carry plain `label` strings; they are outside
 * the localized admin surface for now and are left exactly as they were.
 */
export const COMPANY_STATUS_FILTER_KEYS = [
  { value: "all", labelKey: "ui.adminFilters.companyStatus.all" },
  { value: "verified", labelKey: "ui.adminFilters.companyStatus.verified" },
  { value: "pending", labelKey: "ui.adminFilters.companyStatus.pending" },
  { value: "not-verified", labelKey: "ui.adminFilters.companyStatus.notVerified" },
];

export const COMPANY_DATE_FILTER_KEYS = [
  { value: "any", labelKey: "ui.adminFilters.companyDate.any" },
  { value: "7", labelKey: "ui.adminFilters.companyDate.d7" },
  { value: "30", labelKey: "ui.adminFilters.companyDate.d30" },
  { value: "90", labelKey: "ui.adminFilters.companyDate.d90" },
];

export const COMPANY_SORT_FILTER_KEYS = [
  { value: "newest", labelKey: "ui.adminFilters.companySort.newest" },
  { value: "oldest", labelKey: "ui.adminFilters.companySort.oldest" },
  { value: "name-asc", labelKey: "ui.adminFilters.companySort.nameAsc" },
  { value: "name-desc", labelKey: "ui.adminFilters.companySort.nameDesc" },
  { value: "updated", labelKey: "ui.adminFilters.companySort.updated" },
];

export const USER_ROLE_FILTER_KEYS = [
  { value: "all", labelKey: "ui.adminFilters.userRole.all" },
  { value: "candidate", labelKey: "ui.adminFilters.userRole.candidate" },
  { value: "recruiter", labelKey: "ui.adminFilters.userRole.recruiter" },
  { value: "admin", labelKey: "ui.adminFilters.userRole.admin" },
];

export const USER_STATUS_FILTER_KEYS = [
  { value: "all", labelKey: "ui.adminFilters.userStatus.all" },
  { value: "active", labelKey: "ui.adminFilters.userStatus.active" },
  { value: "inactive", labelKey: "ui.adminFilters.userStatus.inactive" },
  { value: "suspended", labelKey: "ui.adminFilters.userStatus.suspended" },
];

export const USER_SORT_FILTER_KEYS = [
  { value: "newest", labelKey: "ui.adminFilters.userSort.newest" },
  { value: "oldest", labelKey: "ui.adminFilters.userSort.oldest" },
  { value: "name", labelKey: "ui.adminFilters.userSort.name" },
  { value: "activity", labelKey: "ui.adminFilters.userSort.activity" },
];