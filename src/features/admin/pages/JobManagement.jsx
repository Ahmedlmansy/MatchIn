// src/features/admin/pages/JobManagement.jsx
//
// Admin job list. Reads through useAdminJobsQuery, so all data, loading,
// error and empty states come from the server lifecycle — there is no local
// fetch, no useEffect and no mock dataset left on this page.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FilterX } from "lucide-react";
import { useLocalizedPath } from "@/utils/routes";
import { useAdminJobsQuery, useUpdateAdminJobMutation } from "@/features/admin/hooks";
import { ErrorState, containerVariants } from "@/features/admin/shared";
import {
  JOB_COLUMNS,
  JOB_SORT_OPTIONS,
  JOB_STATUS_FILTERS,
  JOB_SOURCE_FILTERS,
} from "@/features/admin/constants/admin.filters";
import {
  JobManagementToolbar,
  JobRow,
  JobManagementSkeleton,
  JobManagementEmpty,
} from "@/features/admin/components/jobManagement";

const DEFAULT_FILTERS = { search: "", status: "all", source: "all", sort: "created-desc" };

/** A filter other than the neutral "all"/"created-desc" is an active filter. */
const hasActiveFilters = (filters) =>
  Boolean(filters.search) ||
  filters.status !== "all" ||
  filters.source !== "all";

export default function JobManagement() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  // One filter object drives both the query key and the request params, so the
  // cache can never disagree with what the user is looking at.
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const setFilter = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const { data, isPending, isError, error, refetch } = useAdminJobsQuery(filters);
  const { mutate: updateJob, isPending: isUpdating } = useUpdateAdminJobMutation();

  const jobs = data?.items ?? [];
  const filtered = hasActiveFilters(filters);

  const goToJob = (jobId) => navigate(localizedPath(`/dashboard/job-management/${jobId}`));

  const handleChangeStatus = (job, status) => {
    setActiveMenuId(null);
    updateJob({ id: job.id, status: status.toLowerCase() });
  };

  // Server-side filtering means "empty" has two distinct causes, and they get
  // different copy: no jobs exist at all, vs. no jobs match the filters.
  const renderRows = () => {
    if (isPending) return <JobManagementSkeleton />;
    if (isError) {
      return (
        <ErrorState
          title="Couldn't load jobs"
          description={error?.message || "Something went wrong while fetching the job list."}
          onRetry={() => refetch()}
        />
      );
    }
    if (jobs.length === 0) {
      return filtered ? (
        <NoMatches onClear={clearFilters} />
      ) : (
        <JobManagementEmpty />
      );
    }

    return (
      <div>
        <JobManagementToolbar
          filters={filters}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
          statusOptions={JOB_STATUS_FILTERS}
          sourceOptions={JOB_SOURCE_FILTERS}
          sortOptions={JOB_SORT_OPTIONS}
        />

        <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 mt-4 text-[10.5px] font-semibold text-muted uppercase tracking-wide">
          {JOB_COLUMNS.map((column) => (
            <div key={column.label} className={column.className}>
              {column.label}
            </div>
          ))}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                isMenuOpen={activeMenuId === job.id}
                onToggleMenu={(open) => setActiveMenuId(open ? job.id : null)}
                onView={() => goToJob(job.id)}
                onEdit={() => goToJob(job.id)}
                onChangeStatus={(status) => handleChangeStatus(job, status)}
                companyHref={
                  job.companyId ? localizedPath(`/dashboard/company-management/${job.companyId}`) : null
                }
                isUpdating={isUpdating}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[#F5F2EC] to-background text-[#1B1C1A] font-sans antialiased pb-12">
      <main className="max-w-[1180px] mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="font-extrabold text-[24px] tracking-tight text-[#1B1C1A]">
            {t("pages.admin.jobManagement.title")}
          </h1>
          <p className="text-[13.5px] text-muted mt-1">
            {t("pages.admin.jobManagement.subtitle")}
          </p>
        </div>

        {renderRows()}
      </main>
    </div>
  );
}

/** "Nothing matched, here are the filters to reset" card. */
function NoMatches({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 text-center bg-white border border-border rounded-2xl mt-3 shadow-sm"
    >
      <FilterX className="w-8 h-8 text-muted mx-auto mb-2" />
      <p className="text-[13.5px] text-muted">No jobs match your search or filters.</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-[12.5px] font-semibold text-primary hover:underline"
      >
        Clear filters
      </button>
    </motion.div>
  );
}