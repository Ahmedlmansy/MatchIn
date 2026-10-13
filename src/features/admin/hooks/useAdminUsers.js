// src/features/admin/hooks/useAdminUsers.js
//
// User-management reads and writes: list query, detail query, and the
// mutations behind Add / Edit / Change Role / Activate / Deactivate / Delete.

import { useAdminQuery, useAdminMutation, toQueryParams } from "./useAdminQuery";
import { adminKeys, adminInvalidation } from "@/features/admin/constants/admin.query-keys";
import {
  fetchAdminUsersRequest,
  fetchAdminUserRequest,
  createAdminUserRequest,
  updateAdminUserRequest,
  setAdminUserStatusRequest,
  deleteAdminUserRequest,
} from "@/features/admin/api/admin-users.api";

/**
 * User list. Server-side search/filter/sort/pagination.
 * @returns { data: { items, total, page, pageCount }, isPending, isError, error, refetch }
 */
export function useAdminUsersQuery(filters, options = {}) {
  const params = toQueryParams(filters);

  return useAdminQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => fetchAdminUsersRequest(params),
    ...options,
  });
}

/** Single user with profile, CV, applications and counters. */
export function useAdminUserQuery(userId, options = {}) {
  return useAdminQuery({
    queryKey: adminKeys.user(userId),
    queryFn: () => fetchAdminUserRequest(userId),
    enabled: Boolean(userId),
    ...options,
  });
}

/** POST /api/admin/users */
export function useCreateAdminUserMutation() {
  return useAdminMutation({
    mutationFn: createAdminUserRequest,
    invalidates: [adminInvalidation.users, adminInvalidation.dashboard],
  });
}

/**
 * PATCH /api/admin/users/{id} — edit profile fields.
 * Backs both the Edit form and the Change Role dialog: a role change is a
 * partial update with a single field.
 */
export function useUpdateAdminUserMutation(userId) {
  return useAdminMutation({
    mutationFn: (payload) => updateAdminUserRequest({ id: userId, ...payload }),
    invalidates: [adminInvalidation.users, adminInvalidation.dashboard],
  });
}

/** Activate / Deactivate / Suspend. Same endpoint, different status value. */
export function useSetAdminUserStatusMutation(userId) {
  return useAdminMutation({
    mutationFn: (status) => setAdminUserStatusRequest({ id: userId, status }),
    invalidates: [adminInvalidation.users, adminInvalidation.dashboard],
  });
}

/** DELETE /api/admin/users/{id} */
export function useDeleteAdminUserMutation(userId) {
  return useAdminMutation({
    mutationFn: () => deleteAdminUserRequest(userId),
    invalidates: [adminInvalidation.users, adminInvalidation.dashboard],
  });
}