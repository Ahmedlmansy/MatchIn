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

export const JOB_STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "expired", label: "Expired" },
  { id: "closed", label: "Closed" },
];

export const JOB_SOURCE_FILTERS = [
  { id: "all", label: "All sources" },
  { id: "internal", label: "Internal" },
  { id: "external", label: "External sources" },
];

export const JOB_SORT_OPTIONS = [
  { value: "created-desc", label: "Newest created" },
  { value: "published-desc", label: "Recently published" },
  { value: "freshness", label: "Freshness (newest first)" },
];

/** Desktop column headers for the job list grid. */
export const JOB_COLUMNS = [
  { label: "Job / Company", className: "col-span-4" },
  { label: "Location & Mode", className: "col-span-2" },
  { label: "Status", className: "col-span-2" },
  { label: "Source & Freshness", className: "col-span-2" },
  { label: "Dates", className: "col-span-1" },
  { label: "Actions", className: "col-span-1 text-right" },
];

export const JOB_STATUS_OPTIONS = ["Active", "Draft", "Closed"];

/** --- Companies --- */

export const COMPANY_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "not-verified", label: "Not Verified" },
];

export const COMPANY_DATE_FILTER_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export const COMPANY_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "updated", label: "Last updated" },
];

/** --- Users --- */

export const USER_ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "candidate", label: "Candidate" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
];

export const USER_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export const USER_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "activity", label: "Last activity" },
];

// --- Audit Logs ---
// Filter option lists are intentionally empty-value driven: the backend owns
// which actions/entities/actors exist, so these are populated from the loaded
// rows rather than hard-coded. See buildAuditFilterOptions in the page.

export const AUDIT_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "actor-az", label: "Actor A–Z" },
];