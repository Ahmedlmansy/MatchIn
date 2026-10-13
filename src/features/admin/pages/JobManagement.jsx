// src/features/admin/pages/JobManagement.jsx
//
// Admin job list. Reads through useAdminJobsQuery, so all data, loading,
// error and empty states come from the server lifecycle — there is no local
// fetch, no useEffect and no mock dataset left on this page.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FilterX } from "lucide-react";
import { useLocalizedPath } from "@/utils/routes";
import { useAdminJobsQuery, useUpdateAdminJobMutation } from "@/features/admin/hooks";
import { ErrorState, ResultsPagination, containerVariants } from "@/features/admin/shared";
import { filtersToUrlParams } from "@/features/admin/api/normalize";
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

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  source: "all",
  sort: "created-desc",
  page: 1,
};

/**
 * Deep links into this list arrive as query params — a company's detail page
 * sends ?search=… and the dashboard's "Review Pending" sends ?status=pending.
 * Nothing read them, so every one of those links landed on an unfiltered list
 * and looked broken. Seed the initial filters from the URL, ignoring anything
 * that isn't a key we know, so an unknown param can't blank the toolbar.
 */
function filtersFromParams(params) {
  // The job filter options are keyed by `id` (unlike every other admin filter
  // list, which uses `value`) — see admin.filters.js.
  const pickFrom = (key, allowed) => {
    const value = params.get(key);
    return value && allowed.includes(value) ? value : null;
  };

  return {
    ...DEFAULT_FILTERS,
    search: params.get("search") ?? DEFAULT_FILTERS.search,
    status:
      pickFrom(
        "status",
        JOB_STATUS_FILTERS.map((option) => option.id),
      ) ?? DEFAULT_FILTERS.status,
    source:
      pickFrom(
        "source",
        JOB_SOURCE_FILTERS.map((option) => option.id),
      ) ?? DEFAULT_FILTERS.source,
  };
}

/** A filter other than the neutral "all"/"created-desc" is an active filter. */
const hasActiveFilters = (filters) =>
  Boolean(filters.search) ||
  filters.status !== "all" ||
  filters.source !== "all";

export default function JobManagement() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const [searchParams, setSearchParams] = useSearchParams();

  // One filter object drives both the query key and the request params, so the
  // cache can never disagree with what the user is looking at.
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams));
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Mirror the filters back into the URL. The page reads them from the URL on
  // mount, so without this a search the user typed is lost on the next visit —
  // and a deep link would keep re-applying itself over the top of whatever
  // they searched for since. `replace` so filtering doesn't fill the history
  // stack with one entry per keystroke.
  useEffect(() => {
    setSearchParams(filtersToUrlParams(filters), { replace: true });
  }, [filters, setSearchParams]);

  // Any filter change resets to page 1 — otherwise narrowing a filter while on
  // page 3 can land the user on a page that no longer exists.
  const setFilter = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const { data, isPending, isError, error, refetch } = useAdminJobsQuery(filters);
  const {
    mutate: updateJob,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateAdminJobMutation();

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const pageCount = data?.pageCount ?? 1;
  const start = total === 0 ? 0 : (page - 1) * (data?.perPage ?? jobs.length) + 1;
  const filtered = hasActiveFilters(filters);

  const goToJob = (jobId) => navigate(localizedPath(`/dashboard/job-management/${jobId}`));

  // "Edit" used to call goToJob too, so both row actions opened the same
  // inline-editing detail screen. That left EditJobs — a full-page editor with
  // its own query, mutation and unsaved-changes guard, routed at
  // job-management/edit/:jobId — reachable only by typing the URL by hand.
  const goToJobEditor = (jobId) =>
    navigate(localizedPath(`/dashboard/job-management/edit/${jobId}`));

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
                onToggleMenu={(open) => setActiveMenuId((open ? job.id : null))}
                onView={() => goToJob(job.id)}
                onEdit={() => goToJobEditor(job.id)}
                onChangeStatus={(status) => handleChangeStatus(job, status)}
                companyHref={
                  job.companyId ? localizedPath(`/dashboard/company-management/${job.companyId}`) : null
                }
                isUpdating={isUpdating}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Without this the list stopped dead at the backend's default page size
            with no indication and no way forward — page 2 simply did not exist
            anywhere in this page. The wrapper is conditional so a single-page
            result doesn't leave an empty bordered box below the rows. */}
        {pageCount > 1 ? (
          <div className="mt-4 rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <ResultsPagination
              page={page}
              pageCount={pageCount}
              onPageChange={(next) => setFilters((prev) => ({ ...prev, page: next }))}
              label="Job results pages"
              summary={`Showing ${start}–${start + jobs.length - 1} of ${total} jobs`}
            />
          </div>
        ) : null}
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

        {/* A failed status change used to produce no visible result at all —
            the menu simply closed and the badge stayed as it was, which reads
            as the change having been applied. */}
        {updateError ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[13px] font-medium text-destructive"
          >
            {updateError.message}
          </p>
        ) : null}

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