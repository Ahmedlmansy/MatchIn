import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, RefreshCw, ArrowRightLeft, MessageSquare, 
  Check, ChevronDown, Flag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ====================================================================================
 * Internal Sub-Components (Kept in this file to reduce component count)
 * ==================================================================================== */

function TaskRow({ task, phaseNumber, onToggle, isUpdating }) {
  const handleToggle = () => {
    if (!isUpdating) {
      onToggle?.(task.id, !task.done);
    }
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border p-2.5 transition-colors", task.done && "bg-background/50")}>
      <button 
        onClick={handleToggle}
        disabled={isUpdating}
        className={cn(
          "flex size-5 flex-shrink-0 items-center justify-center rounded-[5px] border transition-all cursor-pointer",
          task.done ? "border-success bg-success" : "border-border hover:border-primary/50",
          isUpdating && "opacity-50 cursor-not-allowed"
        )}
      >
        <motion.span initial={false} animate={{ scale: task.done ? 1 : 0, opacity: task.done ? 1 : 0 }}>
          <Check className="size-3 text-white" />
        </motion.span>
      </button>
      <span className={cn("flex-1 text-[13px] transition-all", task.done && "text-muted line-through")}>{task.title}</span>
      {phaseNumber && <span className="flex-shrink-0 text-[11px] text-muted">Phase {phaseNumber}</span>}
    </div>
  );
}

function SkillGapItem({ gap }) {
  const config = {
    high: { bg: "bg-error/10 text-error", label: "HIGH" },
    medium: { bg: "bg-warning/10 text-warning", label: "MEDIUM" },
    low: { bg: "bg-info/10 text-info", label: "LOW" },
  }[gap.priority] || { bg: "bg-muted/10 text-muted", label: "MEDIUM" };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
      <Badge variant="outline" className={cn("mt-0.5 flex-shrink-0 rounded-md border-transparent px-2 py-0.5 text-[10px] font-bold", config.bg)}>
        {config.label}
      </Badge>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-ink">{gap.name}</div>
        <div className="mt-0.5 text-[12px] text-muted leading-relaxed">{gap.reason}</div>
      </div>
    </div>
  );
}

function PhaseAccordion({ phase, onToggleTask, isUpdating }) {
  const [isOpen, setIsOpen] = useState(phase.phaseNumber === 1);
  const progress = phase.completion ?? 0;
  const isCompleted = progress >= 100;
  const isCurrent = !isCompleted && phase.phaseNumber === 1; // Simplified - would come from data
  
  const colorClass = isCompleted 
    ? { icon: "bg-success text-white", bar: "bg-success" }
    : isCurrent
    ? { icon: "border-2 border-primary text-primary", bar: "bg-primary" }
    : { icon: "border-2 border-border text-muted", bar: "bg-border" };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border", isOpen ? "bg-surface" : "bg-transparent")}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center gap-3 p-4 text-left cursor-pointer">
        <div className={cn("flex size-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold", colorClass.icon)}>
          {phase.phaseNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink">{phase.title}</div>
          <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-background">
            <div className={cn("h-full rounded-full transition-all", colorClass.bar)} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="flex-shrink-0 text-[11px] font-semibold text-muted">{progress}%</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex-shrink-0 text-muted">
          <ChevronDown className="size-[18px]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">
              {phase.milestones?.map((m, i) => (
                <div key={m.id ?? i} className="mb-3 mt-1 flex items-center gap-2 text-[12px] font-semibold text-muted">
                  <Flag className="size-4 text-warning" /> Milestone: {m.title ?? m}
                </div>
              ))}
              <div className="space-y-2">
                {phase.tasks?.map((t, i) => (
                  <TaskRow key={t.id ?? i} task={t} phaseNumber={phase.phaseNumber} onToggle={onToggleTask} isUpdating={isUpdating} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ====================================================================================
 * Main Roadmap Board Component
 * ==================================================================================== */

export default function RoadmapBoard({ 
  roadmap, 
  isUpdating, 
  onRefresh, 
  onChangeRole,
  onTaskToggle,
}) {
  const { t } = useTranslation("dashboard");
  const [showCompleted, setShowCompleted] = useState(false);

  const handleTaskToggle = (taskId, completed) => {
    onTaskToggle?.(taskId, completed);
  };

  if (!roadmap) {
    return (
      <div className="text-center py-12 rounded-2xl border border-border bg-surface">
        <p className="text-muted">No roadmap data available</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      
      {/* Updating Banner */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 20 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-[13px] font-semibold text-primary">
              <Loader2 className="size-4 animate-spin" /> Recalculating your roadmap — your profile or target role changed.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Role Header */}
      <div className="mb-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 text-[11px] font-semibold text-secondary uppercase">Target Role</div>
            <h1 className="font-display text-[20px] font-bold text-ink">{roadmap.targetRole ?? "Senior Frontend Engineer"}</h1>
            <div className="mt-1 text-[12px] text-muted">
              {roadmap.targetJobId 
                ? `Based on your saved job · Generated ${roadmap.generatedAt ? new Date(roadmap.generatedAt).toLocaleDateString() : ""}`
                : `Generated ${roadmap.generatedAt ? new Date(roadmap.generatedAt).toLocaleDateString() : ""}`}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-1.5" disabled={isUpdating}>
              <RefreshCw className="size-4" /> {t("ui.roadmap.refresh") || "Refresh"}
            </Button>
            <Button variant="outline" size="sm" onClick={onChangeRole} className="h-9 gap-1.5" disabled={isUpdating}>
              <ArrowRightLeft className="size-4" /> {t("ui.roadmap.changeRole") || "Change target role"}
            </Button>
            <Button size="sm" className="h-9 gap-1.5">
              <MessageSquare className="size-4" /> {t("ui.roadmap.askMentor") || "Ask Mentor"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-5 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 text-[11px] font-semibold text-muted uppercase">Current Baseline</div>
          <div className="mb-1 text-[13px] font-semibold text-ink">{roadmap.baseline?.level ?? "Mid-level Frontend Developer"}</div>
          <p className="mb-3 text-[12px] leading-relaxed text-muted">
            {roadmap.baseline?.skills?.join(", ") ?? "Based on your CV and confirmed skills"}
          </p>
          <div className="text-[11px] text-muted">
            {roadmap.baseline?.experience ?? ""} · Last CV update {roadmap.baseline?.lastCvUpdate ?? ""}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-semibold text-muted uppercase">Overall Progress</div>
            <span className="text-[13px] font-bold text-primary">{roadmap.overallProgress ?? 0}%</span>
          </div>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-primary" style={{ width: `${roadmap.overallProgress ?? 0}%` }}></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-display text-[15px] font-bold">{roadmap.totalPhases ?? roadmap.phases?.length ?? 0}</div>
              <div className="text-[10px] text-muted">{t("ui.roadmap.phases") || "Phases"}</div>
            </div>
            <div>
              <div className="font-display text-[15px] font-bold">{roadmap.completedTasks ?? 0}/{roadmap.totalTasks ?? 0}</div>
              <div className="text-[10px] text-muted">{t("ui.roadmap.tasksDone") || "Tasks done"}</div>
            </div>
            <div>
              <div className="font-display text-[15px] font-bold">~{roadmap.estimatedWeeksRemaining ?? 0} wks</div>
              <div className="text-[10px] text-muted">{t("ui.roadmap.estRemaining") || "Est. remaining"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Skill Gaps */}
      <div className="mb-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-1 font-display text-[15px] font-bold">{t("pages.roadmap.priorityGaps")}</h2>
        <p className="mb-4 text-[12px] text-muted">Ranked by impact on your target role — reasons are generated by the roadmap engine from job requirements and your profile.</p>
        <div className="space-y-3">
          {(roadmap.prioritySkillGaps?.length > 0 ? roadmap.prioritySkillGaps : []).map((gap, i) => (
            <SkillGapItem key={gap.id ?? i} gap={gap} />
          ))}
          {roadmap.prioritySkillGaps?.length === 0 && (
            <p className="text-sm text-muted text-center py-4">{t("pages.roadmap.noGaps") || "No priority skill gaps identified."}</p>
          )}
        </div>
      </div>

      {/* Roadmap Phases */}
      <div className="mb-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-display text-[15px] font-bold">{t("pages.roadmap.phases")}</h2>
        <div className="space-y-3">
          {roadmap.phases?.map((phase) => (
            <PhaseAccordion 
              key={phase.id ?? phase.phaseNumber}
              phase={phase}
              onToggleTask={handleTaskToggle}
              isUpdating={isUpdating}
            />
          ))}
          {(!roadmap.phases || roadmap.phases.length === 0) && (
            <p className="text-sm text-muted text-center py-4">{t("pages.roadmap.noPhases") || "No phases defined yet."}</p>
          )}
        </div>
      </div>

      {/* Weekly Tasks */}
      <div className="mb-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-bold">{t("pages.roadmap.weeklyTasks")}</h2>
          <span className="text-[12px] text-muted">
            {roadmap.weeklyTasks?.filter((t) => t.done).length ?? 0} of {roadmap.weeklyTasks?.length ?? 0} done
          </span>
        </div>
        <div className="space-y-2">
          {roadmap.weeklyTasks?.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={handleTaskToggle} isUpdating={isUpdating} />
          ))}
          {(!roadmap.weeklyTasks || roadmap.weeklyTasks.length === 0) && (
            <p className="text-sm text-muted text-center py-4">{t("pages.roadmap.noWeeklyTasks") || "No weekly tasks for this week."}</p>
          )}
        </div>
        <p className="mt-3 text-[11px] text-muted">Tap a checkbox to mark complete — tap again to undo.</p>
      </div>

      {/* Completed Tasks */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <button onClick={() => setShowCompleted(!showCompleted)} className="flex w-full items-center justify-between cursor-pointer">
          <h2 className="font-display text-[15px] font-bold">
            {t("pages.roadmap.completedTasks")} 
            <span className="font-normal text-muted">
              ({roadmap.weeklyTasks?.filter((t) => t.done).length ?? 0})
            </span>
          </h2>
          <motion.div animate={{ rotate: showCompleted ? 180 : 0 }} className="text-muted"><ChevronDown className="size-[18px]" /></motion.div>
        </button>
        <AnimatePresence>
          {showCompleted && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-2">
                {roadmap.weeklyTasks?.filter((t) => t.done).map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={handleTaskToggle} isUpdating={isUpdating} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}