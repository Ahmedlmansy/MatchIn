import { Link } from "react-router-dom";
import { Bookmark, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";

/**
 * @typedef {Object} SavedJobItem
 * @property {string} id
 * @property {string} title
 * @property {string} company
 */

/**
 * Saved Jobs summary card for the candidate dashboard.
 * Uses only MatchIn @theme tokens.
 *
 * @param {{
 *   jobs?: SavedJobItem[],
 *   isPartial?: boolean,
 *   className?: string,
 *   savedJobsQuery?: ReturnType<import("@/features/candidate/hooks/useJobsQuery").useSavedJobsQuery>,
 * }} props
 */
export default function SavedJobsCard({
  jobs = DEFAULT_SAVED_JOBS,
  isPartial = false,
  className,
  savedJobsQuery,
}) {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("dashboard");
  
  // Use passed query or fall back to defaults
  const isLoading = savedJobsQuery?.isLoading ?? false;
  const isError = savedJobsQuery?.isError ?? false;
  const _error = savedJobsQuery?.error;
  const refetch = savedJobsQuery?.refetch;
  
  // Determine if we have actual data from the query
  const hasQueryData = savedJobsQuery?.data !== undefined;
  const displayJobs = hasQueryData ? jobs : DEFAULT_SAVED_JOBS;
  const isEmpty = isPartial || displayJobs.length === 0;

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <div
      id="saved-jobs-card"
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-primary">{t("overview.savedJobsCard.title")}</h2>
        <Link
          to={localizedPath("/dashboard/saved-jobs")}
          className="text-[12px] font-semibold text-primary hover:underline"
        >
          {t("overview.savedJobsCard.view")}
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label={t("overview.savedJobsCard.loading")}>
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-2.5 text-[13px]">
              <div className="h-4 w-4 shrink-0 rounded bg-border" />
              <div className="h-4 w-3/4 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-4">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-error" />
          <p className="text-[12.5px] text-muted mb-3">
            {t("overview.savedJobsCard.error")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("overview.savedJobsCard.retry")}
          </Button>
        </div>
      ) : isEmpty ? (
        <p className="text-[12.5px] text-muted">{t("overview.savedJobsCard.empty")}</p>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-2.5 text-[13px] text-ink"
            >
              <Bookmark className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate">
                {job.title} — {job.company}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_SAVED_JOBS = [
  { id: "1", title: "Full Stack Engineer", company: "FinEdge" },
  { id: "2", title: "Frontend Infra Eng.", company: "CloudScale" },
];
