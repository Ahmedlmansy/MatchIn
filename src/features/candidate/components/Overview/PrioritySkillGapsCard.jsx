import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @typedef {"high" | "medium"} SkillGapLevel
 * @typedef {Object} SkillGap
 * @property {string} id
 * @property {string} name
 * @property {SkillGapLevel} level
 */

/**
 * Priority skill gaps card for the candidate dashboard.
 * Uses only MatchIn @theme tokens.
 *
 * Level mapping:
 * - high   → error (muted red)
 * - medium → warning / accent (amber / golden)
 *
 * @param {{
 *   skills?: SkillGap[],
 *   className?: string,
 *   roadmapQuery?: ReturnType<import("@/features/candidate/hooks/useRoadmapQuery").useRoadmapQuery>,
 * }} props
 */
export default function PrioritySkillGapsCard({
  skills = DEFAULT_SKILLS,
  className,
  roadmapQuery,
}) {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");
  
  // Use passed query or fall back to defaults
  const isLoading = roadmapQuery?.isLoading ?? false;
  const isError = roadmapQuery?.isError ?? false;
  const refetch = roadmapQuery?.refetch;
  
  // Determine if we have actual data from the query
  const hasQueryData = roadmapQuery?.data !== undefined;
  const displaySkills = hasQueryData ? skills : DEFAULT_SKILLS;
  const isEmpty = displaySkills.length === 0;

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className,
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-primary">
          {t("overview.skillGaps.title")}
        </h2>
        <Link
          to={localizedPath("/dashboard/roadmap")}
          className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
        >
          {t("overview.skillGaps.openRoadmap")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mb-4 text-[12.5px] text-muted">
        {t("overview.skillGaps.description")}
      </p>

      {isLoading ? (
        <div className="space-y-2" aria-label={t("overview.skillGaps.loading")}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-border" />
              <span className="w-24 h-4 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-4">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-error" />
          <p className="text-[12.5px] text-muted mb-3">
            {t("overview.skillGaps.error")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("overview.skillGaps.retry")}
          </Button>
        </div>
      ) : isEmpty ? (
        <p className="text-[12.5px] text-muted">
          {t("overview.skillGaps.empty")}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displaySkills.map((skill) => (
            <SkillGapPill key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillGapPill({ skill }) {
  const isHigh = skill.level === "high";

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold",
        isHigh
          ? "border-error/25 bg-error/10 text-error"
          : "border-warning/25 bg-warning/10 text-warning",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isHigh ? "bg-error" : "bg-warning",
        )}
      />
      {skill.name}
    </span>
  );
}

const DEFAULT_SKILLS = [
  { id: "1", name: "System Design", level: "high" },
  { id: "2", name: "GraphQL", level: "medium" },
  { id: "3", name: "Testing (Jest)", level: "medium" },
];
