import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import JobCard from "@/components/shared/JobCard";
import JobFilters from "../components/JobsPage/JobFilters";
import JobModalViews from "../components/JobsPage/JobModalViews";
import { useJobsQuery } from "@/features/candidate/hooks/useJobsQuery";
import { useApplyJobMutation } from "@/features/candidate/hooks/useJobMutations";
import { useSaveJobMutation } from "@/features/candidate/hooks/useJobMutations";

export default function JobsPage() {
  const { t } = useTranslation("dashboard");
  const [view, setView] = useState("none");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [filterState, setFilterState] = useState({
    search: "",
    location: "All Locations",
    workType: "All Types",
    experienceLevel: "Junior",
    sortBy: "match",
    page: 1,
    limit: 20,
  });

  const form = useForm({
    defaultValues: {
      cv: "",
      authorized: "",
      startDate: "",
    },
  });

  // Build API params from filter state
  const apiParams = useMemo(() => {
    const params = { page: filterState.page, limit: filterState.limit };
    if (filterState.search) params.search = filterState.search;
    if (filterState.location !== "All Locations") params.location = filterState.location;
    if (filterState.workType !== "All Types") params.workType = filterState.workType;
    if (filterState.experienceLevel !== "Junior") params.experienceLevel = filterState.experienceLevel;
    if (filterState.sortBy) params.sortBy = filterState.sortBy;
    return params;
  }, [filterState]);

  const { data: jobsData, isLoading, isError, error, refetch, isFetching } = useJobsQuery(apiParams);
  const jobs = jobsData?.jobs ?? [];
  const meta = jobsData?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 };

  const applyMutation = useApplyJobMutation();
  const saveMutation = useSaveJobMutation();

  const openApply = useCallback((job) => {
    setActiveJob(job);
    form.reset();
    setView("loading");
    // Simulate checking previous application
    setTimeout(() => setView("form"), 900);
  }, [form]);

  const closeModal = useCallback(() => {
    setView("none");
    setActiveJob(null);
  }, []);

  const handleSubmit = useCallback(async (data) => {
    if (!activeJob) return;
    setView("submitting");
    try {
      await applyMutation.mutateAsync({ jobId: activeJob.id, payload: data });
      setView("success");
    } catch (error) {
      // Error handled by mutation's onError
      setView("servererror");
    }
  }, [activeJob, applyMutation]);

  const handleSaveJob = useCallback((job) => {
    const currentlySaved = job.isBookmarked ?? false;
    saveMutation.mutate({ jobId: job.id, saved: currentlySaved });
  }, [saveMutation]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilterState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilterState((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleSearch = useCallback((search) => {
    setFilterState((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-primary antialiased">
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pb-16 pt-8 md:px-8">
        <JobFilters
          open={filtersOpen}
          onToggle={() => setFiltersOpen((value) => !value)}
          filters={filterState}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold text-primary">
              {t("pages.recommendedOpportunities")}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>
                Showing {jobs.length} of {meta.total} jobs
              </span>
              {isFetching && !isLoading && (
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                  Updating...
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading jobs">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <JobCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-surface">
              <p className="text-muted mb-4">Failed to load jobs</p>
              <p className="text-xs text-muted mb-4">{error?.message ?? "Unknown error"}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    onApply={openApply}
                    onSave={handleSaveJob}
                  />
                ))}
              </div>

              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium text-muted hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium text-primary">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium text-muted hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 rounded-2xl border border-border bg-surface">
              <p className="text-muted">No jobs found matching your criteria</p>
              <button
                onClick={() => setFilterState({
                  search: "",
                  location: "All Locations",
                  workType: "All Types",
                  experienceLevel: "Junior",
                  sortBy: "match",
                  page: 1,
                  limit: 20,
                })}
                className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {view !== "none" && activeJob && (
          <JobModalViews
            view={view}
            activeJob={activeJob}
            form={form}
            onClose={closeModal}
            onRetry={() => setView("form")}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Skeleton component for loading state
function JobCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="cursor-pointer group flex h-full flex-col justify-between rounded-2xl border-border bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted animate-pulse" />
              <div className="flex flex-col min-w-0">
                <div className="h-4 w-3/4 rounded animate-pulse bg-muted" />
                <div className="h-3 w-1/2 rounded animate-pulse bg-muted mt-1" />
              </div>
            </div>
            <div className="h-6 w-20 rounded-full animate-pulse bg-muted shrink-0" />
          </div>
          <div className="h-6 w-40 animate-pulse bg-muted" />
          <div className="h-5 w-24 animate-pulse bg-muted mt-1" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-20 rounded animate-pulse bg-muted" />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="h-3 w-24 animate-pulse bg-muted" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full animate-pulse bg-muted" />
            <div className="h-8 w-24 rounded-lg animate-pulse bg-muted" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}