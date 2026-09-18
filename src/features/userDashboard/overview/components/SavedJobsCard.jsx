import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * }} props
 */
export default function SavedJobsCard({
  jobs = DEFAULT_SAVED_JOBS,
  isPartial = false,
  className,
}) {
  const isEmpty = isPartial || jobs.length === 0;

  return (
    <div
      id="saved-jobs-card"
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-primary">Saved jobs</h2>
        <Link
          to="/saved-jobs"
          className="text-[12px] font-semibold text-primary hover:underline"
        >
          View Saved Jobs
        </Link>
      </div>

      {isEmpty ? (
        <p className="text-[12.5px] text-muted">You haven&apos;t saved any jobs yet.</p>
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
