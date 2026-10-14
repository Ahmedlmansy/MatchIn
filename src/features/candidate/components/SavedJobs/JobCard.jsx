import { AnimatePresence, motion } from "framer-motion";
import { Check, Edit3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="mt-4 size-4 shrink-0 rounded bg-border" />
          <div className="size-13 shrink-0 rounded-xl bg-border" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded bg-border" />
            <div className="h-3 w-full rounded bg-border/70" />
            <div className="h-3 w-2/3 rounded bg-border/70" />
          </div>
        </div>
        <div className="h-7 w-28 self-end rounded-full bg-border sm:self-auto" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="h-6 w-20 rounded-md bg-border/70" />
        <div className="h-6 w-24 rounded-md bg-border/70" />
        <div className="h-6 w-28 rounded-md bg-border/70" />
      </div>
      <div className="mt-5 space-y-2 border-t border-border pt-4">
        <div className="h-3 w-full rounded bg-border/60" />
        <div className="h-3 w-4/5 rounded bg-border/60" />
      </div>
    </div>
  );
}

// Transform API job to SavedJobs JobCard format
function transformJobForSavedJobs(job) {
  const fitScore = job.fitScore ?? job.matchPercent ?? 0;
  const totalSkills = (job.tags?.length ?? 0) + (job.extraSkillsCount ?? 0);
  const matchedSkills = Math.round((fitScore / 100) * totalSkills) || Math.min(totalSkills, 9);
  
  return {
    ...job,
    // Map fields to expected format
    logo: job.initial ?? job.company?.[0]?.toUpperCase() ?? "J",
    badge: job.postedAgo ?? "Recent",
    salary: job.salaryRange ?? "$0 - $0 / yr",
    verification: job.verification,
    fitScore,
    fitFraction: `${matchedSkills}/${totalSkills} Fit`,
    fitLabel: job.fitLabel ?? (fitScore >= 75 ? "High Confidence Match" : fitScore >= 50 ? "Moderate Match" : "Low Match"),
    skills: job.tags ?? job.skills ?? [],
    extraSkillsCount: job.extraSkillsCount ?? 0,
    description: job.description ?? "",
    responsibilities: job.responsibilities ?? [],
    source: job.source ?? "MatchIn",
    method: job.method ?? "Internal",
    experience: job.experience ?? "Not specified",
    rationaleTitle: job.rationaleTitle,
    rationaleSub: job.rationaleSub,
    strength: job.strength,
    gap: job.gap,
    gapActionText: job.gapActionText,
    note: job.note,
    deadline: job.deadline ?? job.postedAgo ?? "",
    status: job.status ?? "default",
    appliedText: job.appliedText,
  };
}

export default function JobCard({
  job,
  aiState,
  selected,
  expanded,
  editingNote,
  noteValue,
  onSelect,
  onExpand,
  onApply,
  onStartEdit,
  onSaveNote,
  onCancelNote,
  onNoteChange,
  onAction,
  onSave,
}) {
  const { t } = useTranslation("common");
  
  // Transform job data if it's in API format
  const isApiFormat = job.matchPercent !== undefined || job.initial !== undefined;
  const displayJob = isApiFormat ? transformJobForSavedJobs(job) : job;
  
  const isDimmed = aiState === "low" && displayJob.fitScore < 75;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: isDimmed ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-xs group relative ${isDimmed ? "filter grayscale-[0.4]" : ""}`}
    >
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="mt-4"
          />
          <div className="w-13 h-13 rounded-xl bg-background border border-border flex items-center justify-center p-2.5 text-primary font-bold text-lg shrink-0">
            {displayJob.logo}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-dm-sans text-lg sm:text-xl font-bold text-primary wrap-break-word">
                {displayJob.title}
              </h3>
              <span className="bg-background text-accent border border-border text-[11px] font-semibold px-2 py-0.5 rounded-md">
                {displayJob.badge}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted flex-wrap">
              <span className="font-semibold text-primary">{displayJob.company}</span>
              <span>•</span>
              <span>{displayJob.location}</span>
              <span>•</span>
              <span className="font-medium text-primary">{displayJob.salary}</span>
              {displayJob.verification && (
                <span className="text-[11px] bg-background border border-border px-2 py-0.5 rounded wrap-break-word">
                  {displayJob.verification}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-start lg:text-end shrink-0 self-end lg:self-auto">
          <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            <Check className="w-3.5 h-3.5" /> {displayJob.fitFraction} ({displayJob.fitScore}
            %)
          </div>
          <span className="block text-[10px] text-muted mt-1">
            {displayJob.fitLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {displayJob.skills.map((skill) => (
          <span
            key={skill}
            className="bg-background border border-border text-primary text-xs font-semibold px-2.5 py-1 rounded-md"
          >
            {skill}
          </span>
        ))}
        {displayJob.extraSkillsCount > 0 && (
          <span className="text-muted text-xs px-2 py-1 rounded-md">
            +{displayJob.extraSkillsCount} {t("ui.savedJobCard.bonusSkills")}
          </span>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border border-border rounded-xl bg-background p-4 text-xs space-y-3 mb-4"
          >
            <div>
              <strong className="text-primary block mb-1">{t("ui.savedJobCard.description")}</strong>
              <p className="text-muted wrap-break-word">{displayJob.description}</p>
            </div>
            <div>
              <strong className="text-primary block mb-1">
                {t("ui.savedJobCard.responsibilities")}
              </strong>
              <ul className="text-muted list-disc ps-4">
                {displayJob.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <span className="text-muted">{t("ui.savedJobCard.source")}: {displayJob.source}</span>
              <span className="text-muted">{t("ui.savedJobCard.method")}: {displayJob.method}</span>
              <span className="text-muted">{t("ui.savedJobCard.experience")}: {displayJob.experience}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {displayJob.rationaleTitle && (
        <div className="bg-background border border-border rounded-xl p-3.5 mb-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border pb-2">
            <strong className="text-primary wrap-break-word">
              {displayJob.rationaleTitle}
            </strong>
            <span className="text-muted wrap-break-word">
              {displayJob.rationaleSub}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
            <p className="bg-surface p-2.5 text-muted wrap-break-word">
              {displayJob.strength}
            </p>
            <div className="bg-surface p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              <p className="text-muted wrap-break-word">{displayJob.gap}</p>
              {displayJob.gapActionText && (
                <Button
                  onClick={() => onAction(displayJob)}
                  className="text-[11px] text-secondary shrink-0"
                >
                  {displayJob.gapActionText}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {editingNote ? (
        <div className="border border-border rounded-xl p-3 mb-4 bg-surface">
          <Textarea
            rows={2}
            value={noteValue}
            onChange={(event) => onNoteChange(event.target.value)}
            className="min-h-20 w-full resize-none text-xs leading-relaxed whitespace-normal"
            placeholder={t("ui.savedJobCard.notePlaceholder")}
          />
          <div className="flex flex-wrap justify-end gap-2 mt-2">
            <Button onClick={onCancelNote}>{t("ui.savedJobCard.cancel")}</Button>
            <Button onClick={() => onSaveNote(displayJob.id)}>{t("ui.savedJobCard.saveNote")}</Button>
          </div>
        </div>
      ) : displayJob.note ? (
        <div className="bg-background border border-border rounded-xl p-3 mb-4 text-xs flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate">
            <Edit3 className="w-3.5 h-3.5 inline me-2" />
            <strong>{t("ui.savedJobCard.candidateNote")}:</strong> {displayJob.note}
          </span>
          <Button
            onClick={() => onStartEdit(displayJob)}
            className="text-[11px] text-secondary shrink-0"
          >
            {t("ui.savedJobCard.edit")}
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => onStartEdit(job)}
          className="h-auto min-h-14 w-full items-start justify-between gap-3 whitespace-normal border border-dashed border-border rounded-xl p-3 mb-4 text-start text-xs text-muted"
        >
          <span className="min-w-0 flex-1 italic wrap-break-word">
            {t("ui.savedJobCard.addPlaceholder")}
          </span>
          <span className="shrink-0 self-end text-secondary sm:self-center">
            {t("ui.savedJobCard.addNote")}
          </span>
        </Button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-border text-xs gap-3">
        <span
          className={`wrap-break-word ${displayJob.status === "applied" ? "text-success font-semibold" : "text-muted"}`}
        >
          {displayJob.status === "applied" ? displayJob.appliedText : displayJob.deadline}
        </span>
        <div className="flex w-full sm:w-auto flex-wrap gap-2.5">
          <Button
            onClick={onExpand}
            className="flex-1 sm:flex-none border border-border bg-background text-primary"
          >
            {expanded ? t("ui.savedJobCard.hideDetails") : t("ui.savedJobCard.viewDetails")}
          </Button>
          {displayJob.status === "applied" ? (
            <Button
              disabled
              className="flex-1 sm:flex-none bg-success text-success-foreground"
            >
              <Check className="w-3.5 h-3.5" />
              {t("ui.savedJobCard.applied")}
            </Button>
          ) : (
            <Button
              onClick={() => onApply(displayJob.id)}
              className="flex-1 sm:flex-none bg-secondary text-secondary-foreground"
            >
              <Zap className="w-3.5 h-3.5" />
              {t("ui.savedJobCard.applyFast")}
            </Button>
          )}
          {onSave && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSave(displayJob)}
              className="h-8 w-8 rounded-full border-border text-muted hover:text-primary"
              aria-label="Save job"
            >
              {displayJob.isBookmarked ? (
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              ) : (
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}