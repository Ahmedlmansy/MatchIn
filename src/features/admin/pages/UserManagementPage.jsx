// src/features/admin/pages/UserManagementPage.jsx
//
// Admin user list. Reads through useAdminUsersQuery and writes through the
// user mutations — every action is now a real request instead of a setTimeout
// that rewrote local state.
//
// Dialogs that act on one specific user (edit / change role / activate /
// deactivate) are small local components so each can own its own per-user
// mutation hook. Hooks cannot be called conditionally, so the page only decides
// *which* dialog is open.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import {
  Download,
  Plus,
  Search,
  Users as UsersIcon,
  CheckCircle2,
  Ban,
  Power,
  ShieldCheck,
  Trash2,
  X,
  SearchX,
} from "lucide-react";

import Status from "@/components/shared/Status";
import Modal from "@/components/shared/Modal";
import { UsersTableSkeleton } from "@/components/layouts/skeleton/UsersTableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalizedPath } from "@/utils/routes";
import {
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useSetAdminUserStatusMutation,
  useUpdateAdminUserMutation,
} from "@/features/admin/hooks";
import {
  ErrorState,
  RoleBadge,
  UserStatusBadge,
  ROLE_LABELS,
  STATUS_LABELS,
} from "@/features/admin/shared";
import {
  USER_ROLE_OPTIONS,
  USER_SORT_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/features/admin/constants/admin.filters";
import { TableHead, UserTable } from "@/features/admin/components/UserManagementPage/UserTable";
import Pagination from "@/features/admin/components/UserManagementPage/Pagination";
import {
  UserFormBody,
  ChangeRoleBody,
} from "@/features/admin/components/UserManagementPage/UserDialogs";

const DEFAULT_FILTERS = { search: "", role: "all", status: "all", sort: "newest", page: 1 };

const STAT_CARDS = [
  { key: "total", label: "Total Users", icon: UsersIcon, iconClass: "bg-primary/10 text-primary" },
  { key: "active", label: "Active", icon: CheckCircle2, iconClass: "bg-success/12 text-success" },
  { key: "inactiveOrSuspended", label: "Inactive / Suspended", icon: Ban, iconClass: "bg-muted/12 text-muted" },
  { key: "admins", label: "Admins", icon: ShieldCheck, iconClass: "bg-secondary/12 text-secondary" },
];

const EXPORT_COLUMNS = [
  ["User ID", "id"],
  ["Name", "fullName"],
  ["Email", "email"],
  ["Role", "role"],
  ["Status", "status"],
  ["Created", "createdLabel"],
  ["Last activity", "activityLabel"],
];

function downloadCsv(rows, filename, columns) {
  if (rows.length === 0) return;
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    columns.map(([label]) => escape(label)).join(","),
    ...rows.map((row) => columns.map(([, key]) => escape(row[key])).join(",")),
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function UserManagementPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modal, setModal] = useState(null); // { type, user }

  // Any filter change resets to page 1 so the user is never stranded on a page
  // the new result set doesn't have.
  const setFilter = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const { data, isPending, isError, error, refetch, isFetching } = useAdminUsersQuery(filters);
  const createUser = useCreateAdminUserMutation();

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.perPage ?? 0;
  const page = data?.page ?? 1;
  const pageCount = data?.pageCount ?? 1;
  const firstRow = total === 0 ? 0 : (page - 1) * perPage + 1;
  const lastRow = firstRow + users.length - 1;

  const hasActiveFilters =
    Boolean(filters.search) || filters.role !== "all" || filters.status !== "all";
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  // Counts derive from the loaded rows, so the strip can never disagree with
  // the table underneath it.
  const stats = {
    total,
    active: users.filter((user) => user.status === "active").length,
    inactiveOrSuspended: users.filter((user) => user.status !== "active").length,
    admins: users.filter((user) => user.role === "admin").length,
  };

  const renderStats = () => (
    <div className="mb-5.5 grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2 max-[440px]:grid-cols-1">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[22px] font-bold leading-tight tracking-tight text-ink">
                {stats[card.key]}
              </div>
              <div className="mt-0.5 text-[12.5px] font-medium text-muted">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTable = () => {
    if (isError) {
      return (
        <ErrorState
          title={t("pages.admin.userManagementStates.loadFailed")}
          description={error?.message || "Something went wrong while fetching the users list."}
          onRetry={() => refetch()}
        />
      );
    }

    if (isPending) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <TableHead />
            <UsersTableSkeleton rows={8} />
          </table>
        </div>
      );
    }

    // "Empty" means two different things server-side now: nothing exists, or
    // nothing matched the filters. They get different calls to action.
    if (users.length === 0) {
      return hasActiveFilters ? (
        <Status
          icon={<SearchX className="h-6 w-6" />}
          iconClassName="bg-muted/12 text-muted"
          title={t("pages.admin.userManagementStates.noResults")}
          subtitle="Try adjusting your search or filters."
          primaryButton={{ label: "Clear filters", onClick: clearFilters }}
        />
      ) : (
        <Status
          icon={<UsersIcon className="h-6 w-6" />}
          iconClassName="bg-primary/10 text-primary"
          title={t("pages.admin.userManagementStates.empty")}
          subtitle="Once people sign up, they'll show up here."
          primaryButton={{ label: "Add User", onClick: () => setModal({ type: "add" }) }}
        />
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <TableHead />
            <UserTable
              users={users}
              onView={(user) => navigate(localizedPath(`/dashboard/user-management/${user.id}`))}
              onEdit={(user) => setModal({ type: "edit", user })}
              onChangeRole={(user) => setModal({ type: "changeRole", user })}
              onActivate={(user) => setModal({ type: "activate", user })}
              onDeactivate={(user) => setModal({ type: "deactivate", user })}
              onDelete={(user) => setModal({ type: "delete", user })}
            />
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={pageCount}
          onPageChange={(next) => setFilters((prev) => ({ ...prev, page: next }))}
        />
      </>
    );
  };

  return (
    // px-4 on phones, easing to px-7 from sm up. A flat px-7 left only ~37%
    // of a 375px viewport for content, which is what made the stat grid and
    // toolbar chips feel cramped.
    <div className="min-h-screen bg-background px-4 py-6 sm:px-7 sm:py-8">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink">
              {t("pages.admin.userManagement")}
            </h1>
            <p className="mt-1 text-sm text-muted">Search, view, and manage all platform users</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              disabled={users.length === 0}
              onClick={() => downloadCsv(users, "users.csv", EXPORT_COLUMNS)}
              className="h-10 gap-2 rounded-xl border-border text-ink"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setModal({ type: "add" })}
              className="h-10 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {renderStats()}

        {/* Toolbar */}
        <div className="mb-4.5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
              <Input
                value={filters.search}
                onChange={(event) => setFilter("search")(event.target.value)}
                placeholder="Search by name, email, or user ID…"
                className="h-[42px] rounded-xl border-border ps-10"
              />
            </div>

            <FilterSelectField
              value={filters.role}
              onValueChange={setFilter("role")}
              options={USER_ROLE_OPTIONS}
            />
            <FilterSelectField
              value={filters.status}
              onValueChange={setFilter("status")}
              options={USER_STATUS_OPTIONS}
            />
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.search && (
                <FilterChip label={`Search: ${filters.search}`} onRemove={() => setFilter("search")("")} />
              )}
              {filters.role !== "all" && (
                <FilterChip
                  label={`Role: ${ROLE_LABELS[filters.role] ?? filters.role}`}
                  onRemove={() => setFilter("role")("all")}
                />
              )}
              {filters.status !== "all" && (
                <FilterChip
                  label={`Status: ${STATUS_LABELS[filters.status] ?? filters.status}`}
                  onRemove={() => setFilter("status")("all")}
                />
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-[12.5px] font-semibold text-muted hover:text-ink hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results bar */}
        {!isPending && !isError && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13.5px] text-muted">
              Showing <strong className="font-semibold text-ink">{firstRow}–{lastRow}</strong> of{" "}
              <strong className="font-semibold text-ink">{total}</strong> users
            </div>
            <div className="flex items-center gap-2 text-[13px] text-muted">
              <span>Sort by</span>
              <Select value={filters.sort} onValueChange={setFilter("sort")}>
                <SelectTrigger className="h-[34px] min-w-[160px] rounded-lg border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Table / states */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          {renderTable()}
        </div>

        {/* Legend */}
        {!isPending && !isError && users.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-4 text-[12.5px] text-muted">
            <RoleBadge role="candidate" />
            <RoleBadge role="recruiter" />
            <RoleBadge role="admin" />
            <span className="ms-1">
              <UserStatusBadge status="active" />
            </span>
            <UserStatusBadge status="inactive" />
            <UserStatusBadge status="suspended" />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AnimatePresence>
        {modal?.type === "add" && (
          <Modal onClose={() => setModal(null)}>
            <UserFormBody
              busy={createUser.isPending}
              error={createUser.error?.message}
              onCancel={() => setModal(null)}
              onSubmit={(form) => createUser.mutate(form, { onSuccess: () => setModal(null) })}
              title={t("pages.admin.userManagementStates.addUser")}
              subtitle="Create a new account on the platform."
              submitLabel="Add User"
            />
          </Modal>
        )}

        {modal?.type === "edit" && (
          <EditUserDialog
            user={modal.user}
            title={t("pages.admin.userManagementStates.editUser")}
            subtitle={`Update ${modal.user.fullName}'s details.`}
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "changeRole" && (
          <ChangeRoleDialog user={modal.user} onClose={() => setModal(null)} />
        )}

        {modal?.type === "activate" && (
          <SetStatusDialog
            user={modal.user}
            status="active"
            title={t("pages.admin.userManagementStates.activateUser")}
            subtitle={`${modal.user.fullName} will regain full access to their account.`}
            confirmLabel="Activate"
            busyLabel="Activating…"
            icon={<Power className="h-6 w-6" />}
            iconClassName="bg-success/10 text-success"
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "deactivate" && (
          <SetStatusDialog
            user={modal.user}
            status="inactive"
            title={t("pages.admin.userManagementStates.deactivateUser")}
            subtitle={`${modal.user.fullName} will lose access until reactivated.`}
            confirmLabel="Deactivate"
            busyLabel="Deactivating…"
            icon={<Ban className="h-6 w-6" />}
            iconClassName="bg-error/10 text-error"
            onClose={() => setModal(null)}
          />
        )}

        {modal?.type === "delete" && (
          <DeleteUserDialog user={modal.user} onClose={() => setModal(null)} />
        )}
      </AnimatePresence>

      {/* Subtle progress hint while a background refetch is in flight — the
          rows stay visible rather than flashing the skeleton again. */}
      {isFetching && !isPending && (
        // Physical left on purpose: see AdminOverview — a centred element
        // must not flip, or the physical translate pushes it off-centre.
        <div className="pointer-events-none fixed bottom-4 left-1/2 h-1 w-24 -translate-x-1/2 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}

/**
 * Activate / Deactivate share one dialog. It owns its own
 * useSetAdminUserStatusMutation so the page never has to hold a per-user
 * mutation hook for whichever row happens to be open.
 */
function SetStatusDialog({
  user,
  status,
  title,
  subtitle,
  confirmLabel,
  busyLabel,
  icon,
  iconClassName,
  onClose,
}) {
  const { mutate, isPending, error } = useSetAdminUserStatusMutation(user.id);

  return (
    <Modal onClose={onClose} maxWidth="max-w-[400px]">
      <Status
        icon={icon}
        iconClassName={iconClassName}
        title={title}
        subtitle={error?.message ?? subtitle}
        secondaryButton={{ label: "Cancel", onClick: onClose, disabled: isPending }}
        primaryButton={{
          label: isPending ? busyLabel : confirmLabel,
          onClick: () => mutate(status, { onSuccess: onClose }),
          disabled: isPending,
        }}
      />
    </Modal>
  );
}

function EditUserDialog({ user, title, subtitle, onClose }) {
  const { mutate, isPending, error } = useUpdateAdminUserMutation(user.id);

  return (
    <Modal onClose={onClose}>
      <UserFormBody
        busy={isPending}
        error={error?.message}
        onCancel={onClose}
        onSubmit={(form) => mutate(form, { onSuccess: onClose })}
        title={title}
        subtitle={subtitle}
        submitLabel="Save Changes"
        initialValues={{ fullName: user.fullName, email: user.email, role: user.role }}
      />
    </Modal>
  );
}

function ChangeRoleDialog({ user, onClose }) {
  const { mutate, isPending, error } = useUpdateAdminUserMutation(user.id);

  return (
    <Modal onClose={onClose} maxWidth="max-w-[400px]">
      <ChangeRoleBody
        user={user}
        busy={isPending}
        error={error?.message}
        onCancel={onClose}
        onConfirm={(role) => mutate({ role }, { onSuccess: onClose })}
      />
    </Modal>
  );
}

function DeleteUserDialog({ user, onClose }) {
  const { mutate, isPending, error } = useDeleteAdminUserMutation(user.id);

  return (
    <Modal onClose={onClose} maxWidth="max-w-[400px]">
      <Status
        icon={<Trash2 className="h-6 w-6" />}
        iconClassName="bg-error/10 text-error"
        title="Delete user"
        subtitle={error ? error.message : `This permanently removes ${user.fullName}'s account. This can't be undone.`}
        secondaryButton={{ label: "Cancel", onClick: onClose, disabled: isPending }}
        primaryButton={{
          label: isPending ? "Deleting…" : "Delete User",
          onClick: () => mutate(undefined, { onSuccess: onClose }),
          disabled: isPending,
        }}
      />
    </Modal>
  );
}

function FilterSelectField({ value, onValueChange, options }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-[42px] min-w-[140px] rounded-xl border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/8 px-2.5 text-[12.5px] font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="opacity-65 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}