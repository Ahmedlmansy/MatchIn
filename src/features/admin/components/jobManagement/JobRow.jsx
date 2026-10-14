import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Eye, PencilLine } from "lucide-react";
import {
  InitialsAvatar,
  StatusBadge,
  SourceBadge,
  FreshnessBadge,
  rowVariants,
} from "@/features/admin/shared";
import JobActionMenu from "./JobActionMenu";

/**
 * JobRow
 * Renders a single job entry: company initials avatar, title/company,
 * location & mode, status, source & freshness, dates and row actions.
 *
 * Every action is a real navigation or mutation now — the row no longer
 * dispatches placeholder alerts.
 */
export default function JobRow({
  job,
  isMenuOpen,
  onToggleMenu,
  onView,
  onEdit,
  onChangeStatus,
  companyHref,
  isUpdating,
}) {
  const isClosed = job.status === "expired" || job.status === "closed";

  return (
    <motion.div
      variants={rowVariants}
      layout
      className={`bg-white border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-3 lg:items-center ${
        isClosed ? "opacity-85" : ""
      }`}
    >
      {/* Job Title & Company */}
      <div className="lg:col-span-4 flex items-center gap-3 min-w-0">
        <InitialsAvatar initials={job.companyInitials} />
        <div className="min-w-0">
          <div
            className={`text-[13.5px] font-semibold truncate ${
              job.status === "draft" || job.status === "closed"
                ? "text-[#44474E]"
                : "text-[#1B1C1A]"
            }`}
          >
            {job.title}
          </div>
          {companyHref ? (
            <Link
              to={companyHref}
              className="text-[11.5px] text-muted hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              {job.company} <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-[11.5px] text-muted">{job.company}</span>
          )}
        </div>
      </div>

      {/* Location & Mode */}
      <div className="lg:col-span-2 text-[12.5px] text-[#44474E]">
        <div>{job.location}</div>
        <div className="text-muted text-[11.5px]">{job.type}</div>
      </div>

      {/* Status Badge */}
      <div className="lg:col-span-2">
        <StatusBadge status={job.status} />
      </div>

      {/* Source & Freshness */}
      <div className="lg:col-span-2 flex flex-col gap-1">
        <SourceBadge source={job.source} label={job.sourceLabel} />
        <FreshnessBadge label={job.freshness} days={job.freshnessDays} status={job.status} />
      </div>

      {/* Dates */}
      <div className="lg:col-span-1 text-[11px] text-muted">
        <div>Pub: {job.pubDate}</div>
        <div>Created: {job.createdDate}</div>
      </div>

      {/* Actions */}
      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1 relative">
        <button
          type="button"
          onClick={onView}
          className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          title="View job"
        >
          <Eye className="w-4 h-4" />
        </button>

        {!isClosed && (
          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#44474E] hover:bg-background transition-colors"
            title="Edit job"
          >
            <PencilLine className="w-4 h-4" />
          </button>
        )}

        <JobActionMenu
          job={job}
          isOpen={isMenuOpen}
          onToggle={onToggleMenu}
          companyHref={companyHref}
          onChangeStatus={onChangeStatus}
          isUpdating={isUpdating}
        />
      </div>
    </motion.div>
  );
}