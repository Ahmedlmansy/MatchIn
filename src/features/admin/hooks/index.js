// src/features/admin/hooks/index.js
//
// Barrel for the admin data layer. Pages import from "@/features/admin/hooks"
// rather than reaching into individual files, so the set of admin read/write
// operations is visible in one place.

export { useAdminQuery, useAdminMutation, toQueryParams } from "./useAdminQuery";
export { useAdminDashboardQuery } from "./useAdminDashboard";
export {
  useAdminJobsQuery,
  useAdminJobQuery,
  useCreateAdminJobMutation,
  useUpdateAdminJobMutation,
} from "./useAdminJobs";
export {
  useAdminCompaniesQuery,
  useAdminCompanyQuery,
  useCreateAdminCompanyMutation,
  useUpdateAdminCompanyMutation,
  useMergeAdminCompaniesMutation,
} from "./useAdminCompanies";
export {
  useAdminUsersQuery,
  useAdminUserQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useSetAdminUserStatusMutation,
  useDeleteAdminUserMutation,
} from "./useAdminUsers";
export {
  useAdminAuditLogsQuery,
  useAdminAuditLogQuery,
  useAuditLogDetail,
} from "./useAdminAuditLogs";