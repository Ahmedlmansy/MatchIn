// src/features/admin/pages/JobDetailsPage.jsx
//
// Single job, admin view. Reads through useAdminJobQuery; inline editing and
// status changes go through useUpdateAdminJobMutation, which invalidates the
// list, this record and the overview counters.

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import {
  ArrowLeft,
  SearchX,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PencilLine,
  Building2,
  RefreshCw,
  ExternalLink,
  Save,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Lock,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
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
import { ErrorState } from "@/features/admin/shared";
import { useAdminJobQuery, useUpdateAdminJobMutation } from "@/features/admin/hooks";
import { JOB_STATUS_OPTIONS } from "@/features/admin/constants/admin.filters";
import JobCard from "@/features/admin/components/JobDetailsPage/JobCard";

const LOCATION_OPTIONS = ["Remote", "Hybrid", "Onsite"];
const TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship"];
const LEVEL_OPTIONS = ["Entry level", "Mid level", "Senior level", "Lead / Principal"];

const STATUS_STYLES = {
  Active: "bg-success/10 text-success",
  Draft: "bg-muted/12 text-muted",
  Closed: "bg-error/10 text-error",
};

/** Joins a list of strings into the comma-separated text an <Input> holds. */
const toCsv = (items) => (items ?? []).join(", ");
/** Splits comma-separated text back into a trimmed, non-empty list. */
const fromCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toForm = (job) => ({
  title: job.title,
  location: job.location,
  type: job.type,
  level: job.level,
  description: job.description,
  responsibilities: job.responsibilities.join("\n"),
  requiredSkills: toCsv(job.requiredSkills),
  preferredSkills: toCsv(job.preferredSkills),
});

/** Maps the form's display-cased options back to the API's enum values. */
const toPayload = (form) => ({
  title: form.title.trim(),
  location: form.location,
  employment_type: form.type,
  experience_level: form.level,
  description: form.description,
  responsibilities: form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
  required_skills: fromCsv(form.requiredSkills),
  preferred_skills: fromCsv(form.preferredSkills),
});

export function JobDetailsPage() {
  const { t } = useTranslation("dashboard");
  const localizedPath = useLocalizedPath();
  const { jobId } = useParams();

  const jobsPath = localizedPath("/dashboard/job-management");

  const { data: job, isPending, isError, error, refetch } = useAdminJobQuery(jobId);
  const { mutate: updateJob, isPending: isSaving } = useUpdateAdminJobMutation(jobId);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [titleError, setTitleError] = useState(false);

  const startEditing = () => {
    setForm(toForm(job));
    setTitleError(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setForm(null);
    setTitleError(false);
  };

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = () => {
    if (!form.title.trim()) {
      setTitleError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTitleError(false);
    updateJob(toPayload(form), {
      onSuccess: () => {
        setIsEditing(false);
        setForm(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  const handleUpdateStatus = (option) => {
    updateJob({ status: option.toLowerCase() }, { onSettled: () => setStatusMenuOpen(null) });
  };

  // One flag for both status dropdowns, so they can never be open at once.
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background px-5 py-8">
        <div className="mx-auto max-w-[900px]">
          <JobCard>
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="mb-3 h-5 w-56" />
                <Skeleton className="mb-2 h-3 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </JobCard>
          <JobCard>
            <Skeleton className="mb-5 h-4 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </JobCard>
        </div>
      </div>
    );
  }

  if (isError) {
    const notFound = error?.status === 404;

    return (
      <div className="min-h-screen bg-background px-5 py-8">
        <div className="mx-auto max-w-[900px]">
          {notFound ? (
            <JobCard className="py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background">
                <SearchX className="h-7 w-7 text-muted" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-ink">{t("pages.admin.jobNotFound")}</h2>
              <p className="mx-auto mb-7 max-w-sm text-[13.5px] text-muted">
                This job may have been deleted, or the link you followed is no longer valid.
              </p>
              <Button asChild className="h-11 gap-2 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
                <Link to={jobsPath}>Return to Jobs</Link>
              </Button>
            </JobCard>
          ) : (
            <ErrorState
              title={t("pages.admin.jobDetails.loadFailed")}
              description={error?.message || "Something went wrong on our end. Please try again."}
              onRetry={() => refetch()}
            />
          )}
        </div>
      </div>
    );
  }

  const isStale = job.freshnessDays >= 30;
  const statusLabel = job.status.charAt(0).toUpperCase() + job.status.slice(1);
  const companyPath = job.companyId
    ? localizedPath(`/dashboard/company-management/${job.companyId}`)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-5 py-8">
        {/* Stale banner */}
        {isStale && !isEditing && (
          <Banner tone="warning" icon={Clock}>
            <div className="text-[13.5px] font-bold">
              This listing is stale — last published {Math.floor(job.freshnessDays)} days ago
            </div>
            <div className="mt-0.5 text-[12.5px] opacity-85">
              Consider updating its status or reaching out to the source before candidates keep
              seeing it.
            </div>
          </Banner>
        )}

        {/* Success banner */}
        {updateJob.isSuccess && !isEditing && !isError && (
          <Banner tone="success" icon={CheckCircle2} dismissible onDismiss={() => updateJob.reset()}>
            <div className="flex-1 text-[13.5px] font-semibold">Changes saved successfully.</div>
          </Banner>
        )}

        {/* Error banner */}
        {updateJob.error && (
          <Banner tone="error" icon={AlertTriangle}>
            <div className="flex-1 text-[13.5px] font-semibold">{updateJob.error.message}</div>
          </Banner>
        )}

        {/* Validation banner */}
        {isEditing && titleError && (
          <Banner tone="error" icon={AlertTriangle}>
            <div className="flex-1 text-[13.5px] font-semibold">
              Please fix the highlighted fields before saving.
            </div>
          </Banner>
        )}

        {/* Job Header */}
        <JobCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-sm">
              <span className="font-display text-[22px] font-extrabold text-white">
                {job.companyInitials}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <>
                  <Input
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    className={cn(
                      "mb-1 h-11 rounded-xl border-border font-display text-base font-bold",
                      titleError && "border-error",
                    )}
                  />
                  {titleError && (
                    <p className="mb-1 text-[11.5px] font-semibold text-error">Job title is required.</p>
                  )}
                </>
              ) : (
                <h1 className="mb-1 font-display text-[21px] font-extrabold leading-tight text-ink">
                  {job.title}
                </h1>
              )}

              {companyPath ? (
                <Link
                  to={companyPath}
                  className="mt-1 flex items-center gap-1 text-[13px] text-muted hover:text-primary"
                >
                  {job.company}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="mt-1 block text-[13px] text-muted">{job.company}</span>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                {isEditing ? (
                  <>
                    <Picker
                      value={form.location}
                      onValueChange={(value) => setField("location", value)}
                      options={LOCATION_OPTIONS}
                    />
                    <Picker
                      value={form.type}
                      onValueChange={(value) => setField("type", value)}
                      options={TYPE_OPTIONS}
                    />
                    <Picker
                      value={form.level}
                      onValueChange={(value) => setField("level", value)}
                      options={LEVEL_OPTIONS}
                    />
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {job.level}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                  STATUS_STYLES[statusLabel] ?? STATUS_STYLES.Draft,
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Publication date + freshness — preserved, never editable */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-ink/80">
              <Calendar className="h-3.5 w-3.5" />
              Published {job.pubDate}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
              ● {job.freshness}
            </span>
            {isEditing && (
              <span className="ml-1 flex items-center gap-1 text-[11px] text-muted">
                <Lock className="h-3.5 w-3.5" />
                Preserved from source — not editable
              </span>
            )}
          </div>

          {/* Actions */}
          {isEditing ? (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 gap-1.5 rounded-full bg-primary px-5 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={cancelEditing}
                disabled={isSaving}
                className="h-10 rounded-full border-border px-4 text-[12.5px] font-semibold text-ink"
              >
                Cancel
              </Button>
              {isSaving && (
                <span className="flex items-center gap-2 text-[13px] font-medium text-ink/80">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving changes…
                </span>
              )}
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <Button
                onClick={startEditing}
                className="h-10 gap-1.5 rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <PencilLine className="h-4 w-4" />
                Edit Job
              </Button>

              {companyPath && (
                <Button
                  variant="outline"
                  asChild
                  className="h-10 gap-1.5 rounded-full border-border px-4 text-[12.5px] font-semibold text-ink"
                >
                  <Link to={companyPath}>
                    <Building2 className="h-4 w-4" />
                    View Company
                  </Link>
                </Button>
              )}

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setStatusMenuOpen((open) => !open)}
                  disabled={isSaving}
                  className="h-10 gap-1.5 rounded-full border-border px-4 text-[12.5px] font-semibold text-ink"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update Status
                </Button>
                {statusMenuOpen && (
                  <StatusMenu
                    options={JOB_STATUS_OPTIONS}
                    current={statusLabel}
                    isSaving={isSaving}
                    onSelect={handleUpdateStatus}
                  />
                )}
              </div>

              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-[12.5px] font-semibold text-ink hover:bg-background"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Source
                </a>
              )}

              <Button
                variant="ghost"
                asChild
                className="ml-auto h-10 gap-1.5 rounded-full px-4 text-[12.5px] font-semibold text-muted hover:text-ink"
              >
                <Link to={jobsPath}>
                  <ArrowLeft className="h-4 w-4" />
                  Return to Jobs
                </Link>
              </Button>
            </div>
          )}
        </JobCard>

        {/* Description */}
        <JobCard>
          <CardTitle>{t("pages.admin.jobDetails.description")}</CardTitle>
          {isEditing ? (
            <Textarea
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
              className="resize-none rounded-xl border-border text-[13px]"
            />
          ) : (
            <p className="text-[13px] leading-relaxed text-ink/80">{job.description || "—"}</p>
          )}
        </JobCard>

        {/* Responsibilities */}
        <JobCard>
          <CardTitle>{t("pages.admin.jobDetails.responsibilities")}</CardTitle>
          {isEditing ? (
            <>
              <Textarea
                value={form.responsibilities}
                onChange={(event) => setField("responsibilities", event.target.value)}
                rows={4}
                className="resize-none rounded-xl border-border text-[13px]"
              />
              <p className="mt-1.5 text-[11px] text-muted">One item per line.</p>
            </>
          ) : job.responsibilities.length === 0 ? (
            <p className="text-[13px] text-muted">No responsibilities listed.</p>
          ) : (
            <ul className="space-y-1.5">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-[13px] text-ink/80">
                  <ChevronRight className="mt-0.5 h-[15px] w-[15px] shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </JobCard>

        {/* Required Skills */}
        <JobCard>
          <CardTitle>{t("pages.admin.jobDetails.requiredSkills")}</CardTitle>
          {isEditing ? (
            <>
              <Input
                value={form.requiredSkills}
                onChange={(event) => setField("requiredSkills", event.target.value)}
                className="h-11 rounded-xl border-border text-[13px]"
              />
              <p className="mt-1.5 text-[11px] text-muted">Comma-separated.</p>
            </>
          ) : (
            <SkillChips skills={job.requiredSkills} tone="primary" />
          )}
        </JobCard>

        {/* Preferred Skills */}
        <JobCard>
          <CardTitle>{t("pages.admin.jobDetails.preferredSkills")}</CardTitle>
          {isEditing ? (
            <>
              <Input
                value={form.preferredSkills}
                onChange={(event) => setField("preferredSkills", event.target.value)}
                className="h-11 rounded-xl border-border text-[13px]"
              />
              <p className="mt-1.5 text-[11px] text-muted">Comma-separated.</p>
            </>
          ) : (
            <SkillChips skills={job.preferredSkills} tone="neutral" />
          )}
        </JobCard>

        {/* Source & application method — preserved, never editable */}
        <JobCard>
          <div className="mb-4 flex items-center gap-2">
            <CardTitle>{t("pages.admin.jobDetails.sourceAndMethod")}</CardTitle>
            <Lock className="h-[15px] w-[15px] text-muted" title="Preserved — not editable" />
          </div>
          <div className="grid gap-3 text-[13px] sm:grid-cols-2">
            <Row label="Source">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {job.sourceLabel}
              </span>
            </Row>
            <Row label="Application method">
              <span className="font-medium text-ink">{job.applicationMethod}</span>
            </Row>
            <Row label="Posted by">
              <span className="font-medium text-ink">{job.postedBy}</span>
            </Row>
            {job.sourceUrl && (
              <Row label="Original listing">
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-medium text-primary"
                >
                  Open Source
                  <ExternalLink className="h-[13px] w-[13px]" />
                </a>
              </Row>
            )}
          </div>
        </JobCard>

        {/* Job Status */}
        <JobCard className="mb-0">
          <CardTitle>{t("pages.admin.jobDetails.status")}</CardTitle>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                  STATUS_STYLES[statusLabel] ?? STATUS_STYLES.Draft,
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel}
              </span>
              <p className="mt-2 text-xs text-muted">{STATUS_HINTS[job.status] ?? ""}</p>
            </div>
          </div>
        </JobCard>
      </main>
    </div>
  );
}

const STATUS_HINTS = {
  active: "Visible to candidates in search and recommendations.",
  draft: "Not visible to candidates yet.",
  closed: "No longer accepting applications.",
};

function CardTitle({ children }) {
  return (
    <h2 className="mb-3 font-display text-[15px] font-bold text-ink">{children}</h2>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  );
}

function SkillChips({ skills, tone }) {
  if (skills.length === 0) return <p className="text-[13px] text-muted">None listed.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            tone === "primary" ? "bg-primary/10 text-primary" : "border border-border text-ink/80",
          )}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

function Picker({ value, onValueChange, options }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-auto rounded-lg border-border px-2 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusMenu({ options, current, isSaving, onSelect }) {
  return (
    <div className="absolute left-0 top-11 z-10 w-40 rounded-xl border border-border bg-surface p-1.5 shadow-md">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={isSaving}
          onClick={() => onSelect(option)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium text-ink hover:bg-background disabled:opacity-50",
            current === option && "font-bold text-primary",
          )}
        >
          {option}
          {isSaving && current !== option && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        </button>
      ))}
    </div>
  );
}

const BANNER_TONES = {
  warning: "border-warning/25 bg-warning/10 text-warning",
  success: "border-success/25 bg-success/10 text-success",
  error: "border-error/25 bg-error/10 text-error",
};

function Banner({ tone, icon: Icon, dismissible = false, onDismiss, children }) {
  return (
    <div className={cn("mb-5 flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-sm", BANNER_TONES[tone])}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      {children}
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}