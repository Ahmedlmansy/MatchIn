import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  CircleAlert,
  FileText,
  Send,
  Upload,
  X,
  Zap,
} from "lucide-react";
import Modal from "@/components/shared/Modal";

const CVS = [
  {
    value: "resume-2026.pdf",
    label: "resume_2026.pdf",
    meta: "Updated Aug 12",
  },
  {
    value: "resume-old.pdf",
    label: "resume_frontend_old.pdf",
    meta: "Updated Mar 03",
  },
];

export default function JobApplicationModal({
  job,
  cv,
  authorized,
  startDate,
  errors,
  onCvChange,
  onAuthorizedChange,
  onStartDateChange,
  onClose,
  onSubmit,
}) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-[560px]">
      <div className="max-h-[90vh] overflow-y-auto scrollbar-none">
        <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-2xl border-b border-border bg-white p-6">
          <div>
            <div className="mb-1 text-[11px] font-bold text-secondary">
              Job Application
            </div>
            <h2 className="text-lg font-bold text-primary">
              {job.title}{" "}
              <span className="text-sm font-normal text-muted">
                at {job.company}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-background"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="flex h-fit items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-primary">
              <Zap className="h-4 w-4" /> Method: Internal
            </span>
            <span className="flex h-fit items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-primary">
              <Send className="h-4 w-4" /> Source: SkillMatch Feed
            </span>
          </div>

          <AnimatePresence>
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 rounded-xl border border-error/30 bg-[#FBEAE8] px-4 py-3 text-xs font-bold text-error"
              >
                <CircleAlert className="h-4.5 w-4.5" />
                Please correct the highlighted errors before submitting.
              </motion.div>
            )}
          </AnimatePresence>

          <form
            className="space-y-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <ApplicantDetails />
            <ResumeField cv={cv} error={errors.cv} onChange={onCvChange} />
            <div>
              <label className="mb-2 block text-xs font-bold text-primary">
                Additional Note{" "}
                <span className="font-normal text-muted">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Add a short note for the hiring team — why are you a great fit?"
                className="w-full resize-none rounded-xl border border-border bg-background/50 p-3 text-xs outline-none focus:border-primary"
              />
            </div>
            <SelectField
              label="Are you legally authorized to work in this location?"
              value={authorized}
              error={errors.authorized}
              onChange={onAuthorizedChange}
              options={["Yes", "No", "Require Sponsorship"]}
            />
            <div>
              <label className="mb-2 block text-xs font-bold text-primary">
                Earliest Start Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={onStartDateChange}
                className={`h-10 w-full rounded-xl border px-3 text-xs outline-none focus:border-primary bg-surface-white ${errors.startDate ? "border-error" : "border-border"}`}
              />
              {errors.startDate && (
                <p className="mt-1.5 text-xs font-bold text-error">
                  {errors.startDate}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 rounded-b-2xl border-t border-border bg-white p-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-border px-5 text-xs font-bold text-primary hover:bg-background"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="h-10 flex-1 rounded-xl bg-primary text-xs font-bold text-white hover:bg-[#052045]"
          >
            Submit Application
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ApplicantDetails() {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold text-muted">
        Applicant Details
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ProfileInput label="Full Name" placeholder="Ahmed Mahmoud" />
        <ProfileInput label="Email Address" placeholder="ahmed@example.com" />
      </div>
      <div className="mt-1.5 text-[11px] text-muted">
        Fetched from your profile —{" "}
        <a href="/profile" className="font-bold text-primary hover:underline">
          Edit Profile
        </a>
      </div>
    </div>
  );
}

function ProfileInput({ label, placeholder }) {
  return (
    <div className="h-[46.8px] rounded-xl border border-border bg-background px-3 py-2">
      <div className="-mb-2 text-[10px] text-muted">{label}</div>
      <input
        className="w-full text-xs font-bold text-primary outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function ResumeField({ cv, error, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-primary">
        Select Resume (CV) <span className="text-error">*</span>
      </label>
      <div className="space-y-2">
        {CVS.map((resume) => (
          <label
            key={resume.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${cv === resume.value ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <input
              type="radio"
              name="cv"
              value={resume.value}
              checked={cv === resume.value}
              onChange={(event) => onChange(event.target.value)}
              className="accent-primary"
            />
            <FileText className="text-muted" />
            <span className="flex-1 text-xs font-bold text-primary">
              {resume.label}
            </span>
            <span className="text-[11px] text-muted">{resume.meta}</span>
          </label>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 pt-1 text-xs font-bold text-primary"
        >
          <Upload className="h-4.5 w-4.5" /> Upload another CV
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-error">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, error, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-primary">
        {label} <span className="text-error">*</span>
      </label>
      <div className="relative">
        <ChevronDown className="absolute inset-e-3 top-[50%] h-4 w-4 translate-y-[-50%]" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-10 w-full appearance-none rounded-xl border bg-surface-white px-3 text-xs outline-none focus:border-primary ${error ? "border-error" : "border-border"}`}
        >
          <option value="">Select an answer</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-error">{error}</p>}
    </div>
  );
}
