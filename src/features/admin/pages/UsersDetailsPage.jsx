// src/features/admin/pages/UsersDetailsPage.jsx
//
// Single user, admin view. Reads through useAdminUserQuery; editing, status
// toggles and delete all go through the user mutations, which invalidate the
// list and this record on success.
//
// The editable profile lives in <EditableProfile />, which is mounted only
// while editing and keyed by an edit session. That is what lets Cancel discard
// edits and lets a fresh record reseed the form, without an effect pushing
// query data into state.

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import {
  ChevronRight,
  ArrowLeft,
  PencilLine,
  X,
  CheckCircle2,
  Loader2,
  ArrowLeftRight,
  Power,
  Ban,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useAdminUserQuery,
  useDeleteAdminUserMutation,
  useSetAdminUserStatusMutation,
  useUpdateAdminUserMutation,
} from "@/features/admin/hooks";
import {
  Section,
  Field,
  AppStatusBadge,
  RoleBadge,
  UserStatusBadge,
  STATUS_LABELS,
} from "@/features/admin/components/UsersDetailsPage/DetailSections";

// This page is scoped to account/profile/activity data only — a user's AI
// mentorship conversations are a different feature/scope and are intentionally
// never surfaced here.

const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "6–10 years",
  "10+ years",
];

const EDITABLE_FIELDS = [
  "fullName",
  "email",
  "phone",
  "location",
  "jobTitle",
  "experience",
  "bio",
];

/** The loaded record -> the editable draft shape. */
const toForm = (user) =>
  Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, user[field] ?? ""]));

/** Stat tile captions (the API returns camelCase keys). */
const STAT_CAPTIONS = {
  applications: "Applications",
  savedJobs: "Saved Jobs",
  cvStatus: "CV Status",
  profile: "Profile",
};

export function UsersDetailsPage() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { id: userId } = useParams();

  const usersPath = localizedPath("/dashboard/user-management");

  const { data: user, isPending, isError, error, refetch } = useAdminUserQuery(userId);
  const updateUser = useUpdateAdminUserMutation(userId);
  const setStatus = useSetAdminUserStatusMutation(userId);
  const deleteUser = useDeleteAdminUserMutation(userId);

  const [isEditing, setIsEditing] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const startEditing = () => {
    setEditSession((session) => session + 1);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditSession((session) => session + 1);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${user.fullName}? This can't be undone.`)) {
      deleteUser.mutate(undefined, { onSuccess: () => navigate(usersPath) });
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2.5 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading user…</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="mb-1 text-lg font-bold text-ink">
            {error?.status === 404
              ? t("pages.admin.userNotFound")
              : t("pages.admin.userLoadFailed")}
          </h1>
          <p className="mb-5 text-sm text-muted">
            {error?.message || "Something went wrong. Please try again."}
          </p>
          <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to={usersPath}>Back to Users</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => (error?.status === 404 ? navigate(usersPath) : refetch())}
            className="ml-2.5 rounded-xl"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isActive = user.status === "active";
  const actionError = updateUser.error || setStatus.error || deleteUser.error;

  return (
    <div className="min-h-screen bg-background px-7 py-8">
      <div className="mx-auto max-w-[1100px]">
        {/* Breadcrumb */}
        <div className="mb-3.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
          <Link to={usersPath} className="hover:text-primary">
            Users
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-55" />
          <span>{user.id}</span>
        </div>

        <MutationBanner
          error={actionError}
          isSaving={updateUser.isPending || setStatus.isPending}
        />

        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {user.initials}
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-ink">{user.fullName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
                <span className="font-mono text-[13px]">{user.id}</span>
                <span className="h-[3px] w-[3px] rounded-full bg-border" />
                <RoleBadge role={user.role} />
                <span className="h-[3px] w-[3px] rounded-full bg-border" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button variant="ghost" asChild className="h-10 gap-2 rounded-xl text-muted hover:text-ink">
              <Link to={usersPath}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={startEditing}
                className="h-10 gap-2 rounded-xl border-border text-ink"
              >
                <PencilLine className="h-4 w-4" />
                Edit User
              </Button>
            )}
          </div>
        </div>

        {/* Status banner */}
        <div
          className={cn(
            "mb-5.5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4.5 py-3.5",
            isActive && "bg-success/10 border-success/25",
            user.status === "inactive" && "bg-muted/10 border-muted/20",
            user.status === "suspended" && "bg-error/10 border-error/25",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isActive && "bg-success/20 text-success",
                user.status === "inactive" && "bg-muted/15 text-muted",
                user.status === "suspended" && "bg-error/15 text-error",
              )}
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div
                className={cn(
                  "text-[14.5px] font-bold",
                  isActive && "text-success",
                  user.status === "inactive" && "text-muted",
                  user.status === "suspended" && "text-error",
                )}
              >
                Account {STATUS_LABELS[user.status]}
              </div>
              <div className="mt-0.5 text-[13px] text-muted">
                Last activity · {user.dates.lastActivity.sub}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatus.mutate(isActive ? "suspended" : "active")}
            disabled={setStatus.isPending}
            className={cn(
              "h-[34px] gap-1.5 rounded-lg text-[12.5px] disabled:opacity-60",
              isActive
                ? "border-error/35 text-error hover:border-error hover:bg-error/10"
                : "border-success/35 text-success hover:border-success hover:bg-success/10",
            )}
          >
            {isActive ? <Ban className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
            {isActive ? "Suspend" : "Activate"}
          </Button>
        </div>

        {/* Overview stats */}
        <div className="mb-5.5 grid grid-cols-4 gap-3.5 max-[800px]:grid-cols-2 max-[440px]:grid-cols-1">
          {Object.entries(user.stats).map(([key, stat]) => (
            <div
              key={key}
              className="rounded-2xl border border-border bg-surface p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            >
              <div className="text-[12.5px] font-medium text-muted">
                {STAT_CAPTIONS[key] ?? key}
              </div>
              <div className="mt-1 text-[22px] font-bold tracking-tight text-ink">{stat.value}</div>
              {stat.sub && <div className="mt-0.5 text-xs text-muted">{stat.sub}</div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_320px] items-start gap-5 max-[900px]:grid-cols-1">
          {/* LEFT */}
          <div>
            {isEditing ? (
              <EditableProfile
                key={editSession}
                user={user}
                isSaving={updateUser.isPending}
                onSave={(payload) => updateUser.mutate(payload, { onSuccess: () => setIsEditing(false) })}
                onCancel={cancelEditing}
              />
            ) : (
              <ReadOnlyProfile user={user} />
            )}

            {/* CV Status */}
            <Section title={t("pages.admin.userDetails.cvStatus")}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-[560px]:grid-cols-1">
                <Field
                  label="Status"
                  value={
                    <span
                      className={cn(
                        "inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-xs font-bold",
                        user.cv.uploaded
                          ? "bg-success/12 text-success"
                          : "bg-warning/12 text-warning",
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {user.cv.uploaded ? "Uploaded" : "Missing"}
                    </span>
                  }
                />
                <Field
                  label="File"
                  value={
                    user.cv.fileName
                      ? `${user.cv.fileName}${user.cv.fileSize ? ` · ${user.cv.fileSize}` : ""}`
                      : "—"
                  }
                  muted
                />
                <Field label="Uploaded" value={user.cv.uploadedAt ?? "—"} muted />
                <Field label="Last parsed" value={user.cv.lastParsed ?? "—"} muted />
              </div>
            </Section>

            {/* Applications Summary */}
            <Section
              title={t("pages.admin.userDetails.applications")}
              action={{
                label: "View all →",
                onClick: () => navigate(localizedPath("/dashboard/applications")),
              }}
              className="px-5 pb-1 pt-1"
            >
              {user.applications.length === 0 ? (
                <p className="py-3 text-[13.5px] text-muted">No applications yet.</p>
              ) : (
                user.applications.map((application) => (
                  <div
                    key={application.id ?? application.title}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{application.title}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {application.company} · Applied {application.appliedOn}
                      </div>
                    </div>
                    <AppStatusBadge status={application.status} />
                  </div>
                ))
              )}
            </Section>

            {/* Saved Jobs Summary */}
            <Section title={t("pages.admin.userDetails.savedJobs")} className="px-5 pb-1 pt-1">
              {[
                ["Total saved", user.savedJobs.total],
                ["Still open", user.savedJobs.open],
                ["Expired / closed", user.savedJobs.expired],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b border-border py-3"
                >
                  <span className="text-[13.5px] font-medium text-ink">{label}</span>
                  <span className="text-sm font-bold text-ink">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-[13.5px] font-medium text-ink">Last saved</span>
                <span className="text-[13.5px] font-medium text-muted">
                  {user.savedJobs.lastSaved}
                </span>
              </div>
            </Section>
          </div>

          {/* SIDEBAR */}
          <div className="sticky top-6">
            <Section title={t("pages.admin.userDetails.roleStatus")}>
              <div className="mb-3.5">
                <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">
                  Role
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="mb-4">
                <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">
                  Status
                </div>
                <UserStatusBadge status={user.status} />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  disabled={isEditing || updateUser.isPending}
                  onClick={() =>
                    updateUser.mutate(
                      { role: nextRole(user.role) },
                      { onSuccess: cancelEditing },
                    )
                  }
                  className="h-10 w-full justify-center gap-2 rounded-xl border-border text-ink disabled:opacity-60"
                >
                  {updateUser.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowLeftRight className="h-4 w-4" />
                  )}
                  Change Role
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStatus.mutate(isActive ? "suspended" : "active")}
                  disabled={setStatus.isPending}
                  className={cn(
                    "h-10 w-full justify-center gap-2 rounded-xl disabled:opacity-60",
                    isActive
                      ? "border-error/35 text-error hover:border-error hover:bg-error/10"
                      : "border-success/35 text-success hover:border-success hover:bg-success/10",
                  )}
                >
                  {isActive ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  {isActive ? "Suspend" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteUser.isPending}
                  className="h-10 w-full justify-center gap-2 rounded-xl border-error/35 text-error hover:border-error hover:bg-error/10 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </Button>
              </div>
            </Section>

            <Section title={t("pages.admin.userDetails.dates")} className="px-5 pb-1.5 pt-1.5">
              {[
                ["Created", user.dates.created],
                ["Last Activity", user.dates.lastActivity],
                ["Last Login", user.dates.lastLogin],
              ].map(([label, date]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3 border-b border-border py-2.5 text-[13.5px] last:border-b-0"
                >
                  <span className="text-muted">{label}</span>
                  <div className="text-right font-semibold text-ink">
                    {date.date}
                    {date.sub && (
                      <small className="mt-0.5 block text-xs font-normal text-muted">
                        {date.sub}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="ghost" asChild className="h-10 gap-2 rounded-xl text-muted hover:text-ink">
            <Link to={usersPath}>
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Link>
          </Button>

          {isEditing && (
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                onClick={cancelEditing}
                disabled={updateUser.isPending}
                className="h-10 rounded-xl border-border text-ink"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateUser.mutate(toForm(user), { onSuccess: () => setIsEditing(false) })}
                disabled={updateUser.isPending}
                className="h-10 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {updateUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {updateUser.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** candidate -> recruiter -> admin -> candidate */
const ROLE_CYCLE = ["candidate", "recruiter", "admin"];
const nextRole = (role) => ROLE_CYCLE[(ROLE_CYCLE.indexOf(role) + 1) % ROLE_CYCLE.length];

/** Read-only identity + account + career blocks. */
function ReadOnlyProfile({ user }) {
  const { t } = useTranslation("dashboard");

  return (
    <>
      <Section title={t("pages.admin.userDetails.personalInformation")} hint="Identity & contact">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-[560px]:grid-cols-1">
          <Field label="Full Name" value={user.fullName} />
          <Field
            label="Email"
            value={
              <a href={`mailto:${user.email}`} className="font-semibold text-primary hover:underline">
                {user.email}
              </a>
            }
          />
          <Field label="Phone" value={user.phone || "—"} />
          <Field label="Location" value={user.location || "—"} />
        </div>
      </Section>

      <Section title={t("pages.admin.userDetails.accountInformation")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-[560px]:grid-cols-1">
          <Field label="User ID" value={user.id} mono />
          <Field label="Role" value={<RoleBadge role={user.role} />} />
          <Field label="Account Status" value={<UserStatusBadge status={user.status} />} />
          <Field label="Auth Provider" value={user.authProvider} muted />
          <Field
            label="Email Verified"
            value={user.emailVerified ? "Yes" : "No"}
            valueClassName={user.emailVerified ? "text-success" : "text-error"}
          />
          <Field label="Language" value={user.language} muted />
        </div>
      </Section>

      <Section title={t("pages.admin.userDetails.careerProfile")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-[560px]:grid-cols-1">
          <Field label="Job Title" value={user.jobTitle} />
          <Field label="Experience" value={user.experience} />
          <Field
            full
            label="Bio"
            value={<p className="leading-[1.55] text-muted">{user.bio || "—"}</p>}
          />
          <Field
            full
            label="Skills"
            value={
              user.skills.length === 0 ? (
                <span className="text-muted">No skills added yet.</span>
              ) : (
                <div className="mt-1 flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex h-[26px] items-center rounded-full bg-primary/8 px-2.5 text-[12.5px] font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )
            }
          />
        </div>
      </Section>
    </>
  );
}

/**
 * The editable profile.
 *
 * Mounted only while editing and keyed by the edit session, so it can seed its
 * draft from `user` on mount — no effect, and Cancel is just an unmount.
 */
function EditableProfile({ user, isSaving, onSave, onCancel }) {
  const { t } = useTranslation("dashboard");
  const [form, setForm] = useState(() => toForm(user));

  const set = (name) => (value) => setForm((prev) => ({ ...prev, [name]: value }));

  return (
    <>
      <Section title={t("pages.admin.userDetails.personalInformation")} hint="Identity & contact">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-[560px]:grid-cols-1">
          <EditableField label="Full Name" value={form.fullName} onChange={set("fullName")} />
          <EditableField label="Email" type="email" value={form.email} onChange={set("email")} />
          <EditableField label="Phone" value={form.phone} onChange={set("phone")} />
          <EditableField label="Location" value={form.location} onChange={set("location")} />
        </div>
      </Section>

      <Section title={t("pages.admin.userDetails.careerProfile")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 max-[560px]:grid-cols-1">
          <EditableField label="Job Title" value={form.jobTitle} onChange={set("jobTitle")} />
          <div>
            <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Experience
            </label>
            <Select value={form.experience} onValueChange={set("experience")}>
              <SelectTrigger className="h-10 rounded-lg border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 max-[560px]:col-span-1">
            <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-muted">
              Bio
            </label>
            <Textarea
              value={form.bio}
              onChange={(event) => set("bio")(event.target.value)}
              className="rounded-lg border-border"
            />
          </div>
          <Field
            full
            label="Skills"
            muted
            value="Managed from the candidate profile — not editable here."
          />
        </div>
      </Section>

      <div className="mb-4.5 flex flex-wrap items-center justify-end gap-2.5">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 gap-2 rounded-xl border-border text-ink"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={() => onSave(form)}
          disabled={isSaving}
          className="h-10 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </>
  );
}

function EditableField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-muted">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border-border"
      />
    </div>
  );
}

function MutationBanner({ error, isSaving }) {
  if (!error && !isSaving) return null;

  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold",
        error ? "bg-error/10 text-error" : "bg-success/10 text-success",
      )}
    >
      {error ? (
        <>
          <AlertTriangle className="h-4 w-4" /> {error.message}
        </>
      ) : (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving changes…
        </>
      )}
    </div>
  );
}