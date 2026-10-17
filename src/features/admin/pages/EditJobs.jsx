// src/features/admin/pages/EditJobs.jsx
//
// Full-page job editor.
//
// The page is a thin loader; <JobEditor /> is keyed on the record id and owns
// the form state. That way the form initialises once per job and never needs a
// "sync state when the query resolves" effect — switching routes gives a new
// key, and a refetch of the *same* job keeps the user's unsaved edits.

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle2, ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import { ErrorState } from "@/features/admin/shared";
import {
  useAdminCompaniesQuery,
  useAdminJobQuery,
  useUpdateAdminJobMutation,
} from "@/features/admin/hooks";

import UnsavedChangesBanner from "../components/editJobs/UnsavedChangesBanner";
import JobInformationSection from "../components/editJobs/JobInformationSection";
import DescriptionSection from "../components/editJobs/DescriptionSection";
import ResponsibilitiesSection from "../components/editJobs/ResponsibilitiesSection";
import SkillsSection from "../components/editJobs/SkillsSection";
import LocationWorkSection from "../components/editJobs/LocationWorkSection";
import StatusSection from "../components/editJobs/StatusSection";
import SkeletonLoader from "../components/editJobs/SkeletonLoader";

/** The edited record -> the camelCase shape the section components bind to. */
const toFormData = (job) => ({
  jobTitle: job.title,
  company: job.companyId ?? "",
  source: job.source,
  description: job.description,
  responsibilities: job.responsibilities,
  requiredSkills: job.requiredSkills,
  preferredSkills: job.preferredSkills,
  location: job.location,
  experienceLevel: job.level,
  workMode: job.workMode,
  jobType: job.type,
  // The English display-cased word is an internal form value, never rendered:
  // StatusSection shows t(st.labelKey) and only compares this against st.name.
  // Translating it here would break that comparison and post a translated label
  // to the server — see toPayload's `.toLowerCase()`.
  status: job.status.charAt(0).toUpperCase() + job.status.slice(1),
});

/** The form's display-cased values -> the API's snake_case field names. */
const toPayload = (form) => ({
  title: form.jobTitle.trim(),
  company_id: form.company || undefined,
  source: form.source,
  description: form.description,
  responsibilities: form.responsibilities,
  required_skills: form.requiredSkills,
  preferred_skills: form.preferredSkills,
  location: form.location,
  work_mode: form.workMode,
  employment_type: form.jobType,
  experience_level: form.experienceLevel,
  status: form.status.toLowerCase(),
});

export default function EditJob() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { jobId } = useParams();
  const { t } = useTranslation("dashboard");

  const jobsPath = localizedPath("/dashboard/job-management");

  const { data: job, isPending, isError, error, refetch } = useAdminJobQuery(jobId);
  // The company picker needs real companies, not the three hard-coded names
  // this form used to render.
  const { data: companiesData } = useAdminCompaniesQuery({ perPage: 100 });

  if (isPending) return <SkeletonLoader />;

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] p-6 md:p-8">
        <ErrorState
          title={t("pages.admin.jobList.loadFailed.title")}
          description={
            error?.message || t("pages.admin.jobList.loadFailed.description")
          }
          onRetry={() => (error?.status === 404 ? navigate(jobsPath) : refetch())}
        />
      </div>
    );
  }

  return (
    <JobEditor
      key={job.id}
      job={job}
      companies={companiesData?.items ?? []}
      onExit={() => navigate(jobsPath)}
    />
  );
}

function JobEditor({ job, companies, onExit }) {
  const { t } = useTranslation("common");
  const { mutate: saveJob, isPending: isSaving, error: saveError, isSuccess } =
    useUpdateAdminJobMutation(job.id);

  // Both start from the same value: the pristine snapshot IS the saved data.
  const [formData, setFormData] = useState(() => toFormData(job));
  const [savedSnapshot, setSavedSnapshot] = useState(() => toFormData(job));

  // Derived, not stored — the previous version kept an `isDirty` boolean in
  // state and had to sync it with a JSON.stringify effect.
  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(savedSnapshot),
    [formData, savedSnapshot],
  );

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleReset = () => setFormData(savedSnapshot);

  const handleSave = () =>
    saveJob(toPayload(formData), {
      onSuccess: (saved) => {
        // Re-seed both sides of the comparison from the saved record.
        //
        // normalizeJobDetail substitutes placeholders for anything the PATCH
        // response omits ("—", "Untitled job", "Full-time", []). Updating only
        // the snapshot therefore made it a *different shape* from formData,
        // which still held the user's real values — so isDirty stayed true
        // forever after a successful save, the "Unsaved changes" banner and the
        // enabled Save/Reset buttons never went away, and Reset then
        // overwrote the real server values with those placeholders.
        const next = toFormData(saved);
        setFormData(next);
        setSavedSnapshot(next);
      },
    });

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 md:p-8 text-[#18181B] font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8E6E1] pb-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#71717A] mb-2">
              <button type="button" onClick={onExit} className="hover:text-[#09090B]">
                {t("ui.editJob.jobs")}
              </button>
              <span>/</span>
              <span>{job.id}</span>
              <span>/</span>
              <span className="text-[#09090B] font-medium">{t("ui.editJob.edit")}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#09090B]">
              {t("ui.editJob.title")}
            </h1>
            <p className="text-xs text-[#71717A] mt-1.5">
              ID: {job.id} <span className="mx-1">•</span> {t("ui.editJob.by")} {job.company}
            </p>
          </div>

          {/* Action Buttons Top */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#52525B] hover:text-[#09090B] hover:bg-white/60 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              {t("ui.editJob.cancel")}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#09090B] bg-white border border-[#E4E4E7] rounded-lg hover:bg-[#F4F4F5] disabled:opacity-40 transition shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              {t("ui.editJob.reset")}
            </button>

            <SaveButton onClick={handleSave} disabled={!isDirty || isSaving} isSaving={isSaving} />
          </div>
        </div>

        {/* Save feedback */}
        <SaveFeedback error={saveError} isSuccess={isSuccess} />

        {/* Unsaved Changes Banner */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UnsavedChangesBanner onReset={handleReset} onSave={handleSave} isSaving={isSaving} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sections */}
        <div className="space-y-6">
          <JobInformationSection formData={formData} onChange={handleChange} companies={companies} />
          <DescriptionSection formData={formData} onChange={handleChange} />
          <ResponsibilitiesSection formData={formData} onChange={handleChange} />
          <SkillsSection formData={formData} onChange={handleChange} />
          <LocationWorkSection formData={formData} onChange={handleChange} />
          <StatusSection formData={formData} onChange={handleChange} />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E8E6E1]">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 text-xs font-medium text-[#DC2626] hover:text-[#B91C1C] disabled:opacity-30 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            {t("ui.editJob.resetChanges")}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="px-4 py-2 text-xs font-medium text-[#09090B] bg-white border border-[#E4E4E7] rounded-lg hover:bg-[#F4F4F5] transition shadow-xs cursor-pointer"
            >
              {t("ui.editJob.cancel")}
            </button>
            <SaveButton onClick={handleSave} disabled={!isDirty || isSaving} isSaving={isSaving} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveButton({ onClick, disabled, isSaving }) {
  const { t } = useTranslation("dashboard");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1D2A44] rounded-lg hover:bg-[#162034] disabled:opacity-40 transition shadow-xs cursor-pointer"
    >
      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
      {isSaving ? t("ui.editJob.saving") : t("ui.editJob.saveChanges")}
    </button>
  );
}

/** Success / error note for the save mutation. */
function SaveFeedback({ error, isSuccess }) {
  const { t } = useTranslation("dashboard");

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-error/10 px-4 py-3 text-xs font-semibold text-error">
        <AlertTriangle className="h-4 w-4" />
        {error.message}
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-xs font-semibold text-success">
        <CheckCircle2 className="h-4 w-4" />
        {t("ui.editJob.saveSuccess")}
      </div>
    );
  }

  return null;
}