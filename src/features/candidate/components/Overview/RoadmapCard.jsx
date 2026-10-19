import { Link } from "react-router-dom";
import { Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoadmapCard({
  phaseTitle = "Phase 1: Foundations",
  progressPercent = 34,
  tasksLeftLabel = "1 task left this week",
  isPartial = false,
  className,
  roadmapQuery,
}) {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");
  
  // Use passed query or fall back to defaults
  const isLoading = roadmapQuery?.isLoading ?? false;
  const isError = roadmapQuery?.isError ?? false;
  const refetch = roadmapQuery?.refetch;
  
  const clamped = Math.min(100, Math.max(0, progressPercent));

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <div
      id="roadmap-card"
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-primary/80 bg-primary p-6 text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {/* Label */}
      <div className="flex items-center gap-2 text-primary-foreground/80">
        <Route className="h-[18px] w-[18px]" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {t("overview.roadmap.title")}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label={t("overview.roadmap.loading")}>
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 w-1/3 bg-primary-foreground/20 rounded" />
              <div className="h-2 w-full bg-primary-foreground/15 rounded-full overflow-hidden">
                <div className="h-full bg-primary-foreground w-1/4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-4">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-primary-foreground" />
          <p className="text-[12.5px] text-primary-foreground/75 mb-3">
            {t("overview.roadmap.error")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-1.5 bg-surface px-4 py-2 text-primary-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("overview.roadmap.retry")}
          </Button>
        </div>
      ) : isPartial ? (
        <p className="text-[12.5px] leading-relaxed text-primary-foreground/75">
          {t("overview.roadmap.empty")}
        </p>
      ) : (
        <div>
          <h3 className="mb-1 text-[17px] font-bold leading-snug">
            {phaseTitle}
          </h3>

          {/* Progress bar */}
          <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-primary-foreground/15">
            <div
              className="h-full rounded-full bg-primary-foreground transition-[width] duration-500 ease-out"
              style={{ width: `${clamped}%` }}
            />
          </div>

          <p className="text-[12px] text-primary-foreground/70">
            {clamped}% {t("overview.roadmap.overall")} · {tasksLeftLabel}
          </p>
        </div>
      )}

      <Link
        to={localizedPath("/dashboard/roadmap")}
        className="mt-1 inline-flex items-center justify-center self-start rounded-xl bg-surface px-4 py-2 text-[13px] font-bold text-primary shadow-sm transition-colors hover:bg-background"
      >
        {t("overview.roadmap.open")} →
      </Link>
    </div>
  );
}
