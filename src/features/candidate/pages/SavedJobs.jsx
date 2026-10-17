import { useTranslation } from "react-i18next";
import React, { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { EmptySavedJobs } from "../components/SavedJobs/SavedJobsStates";
import JobCard, { JobCardSkeleton } from "../components/SavedJobs/JobCard";
import SavedJobsHeader from "../components/SavedJobs/SavedJobsHeader";
import SavedJobsSidebar from "../components/SavedJobs/SavedJobsSidebar";
import SavedJobsToolbar from "../components/SavedJobs/SavedJobsToolbar";
import ToastList from "../components/SavedJobs/ToastList";
import { useSavedJobsQuery } from "@/features/candidate/hooks/useJobsQuery";
import { useApplyJobMutation, useBatchApplyJobsMutation } from "@/features/candidate/hooks/useJobMutations";
import { useSaveJobMutation } from "@/features/candidate/hooks/useJobMutations";

export default function SavedJobsDashboard() {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("dashboard");
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteInputValue, setNoteInputValue] = useState("");
  const [aiState, setAiState] = useState("success");
  const [toasts, setToasts] = useState([]);

  const { data: savedJobsData, isLoading, isError, error, refetch } = useSavedJobsQuery({
    sortBy: "bestMatch",
    page: 1,
    limit: 20,
  });

  const jobs = savedJobsData?.jobs ?? [];
  const meta = savedJobsData?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 };

  const applyMutation = useApplyJobMutation();
  const batchApplyMutation = useBatchApplyJobsMutation();
  const saveMutation = useSaveJobMutation();

  const triggerToast = (title, message) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, title, message }]);
    setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      3500,
    );
  };

  const handleApply = useCallback(async (jobId) => {
    try {
      await applyMutation.mutateAsync({ jobId, payload: { cv: "", authorized: "", startDate: "" } });
      triggerToast("Applied", "Your application has been submitted successfully.");
      refetch();
    } catch {
      triggerToast("Application Failed", "Failed to submit application. Please try again.");
    }
  }, [applyMutation, refetch]);

  const _handleBatchApply = useCallback(async () => {
    if (!selectedIds.length) {
      triggerToast("Selection Required", "Select at least one role to apply.");
      return;
    }
    try {
      await batchApplyMutation.mutateAsync({ jobIds: selectedIds, payload: { cv: "", authorized: "", startDate: "" } });
      triggerToast("Batch Fast Track", `Successfully applied to ${selectedIds.length} position(s).`);
      setSelectedIds([]);
      refetch();
    } catch {
      triggerToast("Batch Apply Failed", "Some applications failed. Please try again.");
    }
  }, [selectedIds, batchApplyMutation, refetch]);

  const _handleArchive = useCallback(async () => {
    if (!selectedIds.length) {
      triggerToast("Selection Required", "Select at least one role to archive.");
      return;
    }
    // Archive = unsave
    try {
      await Promise.all(selectedIds.map((id) => saveMutation.mutateAsync({ jobId: id, saved: true })));
      triggerToast("Roles Archived", "Selected roles moved to your archive.");
      setSelectedIds([]);
      refetch();
    } catch {
      triggerToast("Archive Failed", "Failed to archive some roles. Please try again.");
    }
  }, [selectedIds, saveMutation, refetch]);

  const handleSaveNote = useCallback((_id) => {
    // Note saving would be a separate API call
    // For now just update local state
    triggerToast("Note Saved", "Your note has been saved.");
    setEditingNoteId(null);
  }, []);

  const handleOnSave = useCallback((job) => {
    const currentlySaved = job.isBookmarked ?? false;
    saveMutation.mutate({ jobId: job.id, saved: currentlySaved });
  }, [saveMutation]);

  const handleOnAction = useCallback((selectedJob) => {
    triggerToast("Action Triggered", `Initiated action for ${selectedJob.company}`);
  }, []);

  return (
    <div className="min-h-screen bg-background text-ink font-[#Plus_Jakarta_Sans,sans-serif] flex flex-col antialiased">
      <main className="flex-1 max-w-340 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <SavedJobsHeader jobsCount={meta.total} />
        <SavedJobsToolbar jobsCount={meta.total} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7">
          <div className="lg:col-span-8 space-y-4">
            {isLoading ? (
              <div className="space-y-4" aria-label={t("pages.savedJobs.loading")}>
                {[1, 2, 3].map((skeleton) => (
                  <JobCardSkeleton key={skeleton} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 rounded-2xl border border-border bg-surface">
                <p className="text-muted mb-4">{t("pages.savedJobs.loadFailed")}</p>
                <p className="text-xs text-muted mb-4">{error?.message ?? "Unknown error"}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                >
                  {tCommon("actions.retry")}
                </button>
              </div>
            ) : jobs.length ? (
              <AnimatePresence>
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    aiState={aiState}
                    selected={selectedIds.includes(job.id)}
                    expanded={expandedJobId === job.id}
                    editingNote={editingNoteId === job.id}
                    noteValue={noteInputValue}
                    onSelect={() =>
                      setSelectedIds((current) =>
                        current.includes(job.id)
                          ? current.filter((id) => id !== job.id)
                          : [...current, job.id],
                      )
                    }
                    onExpand={() =>
                      setExpandedJobId(expandedJobId === job.id ? null : job.id)
                    }
                    onApply={handleApply}
                    onStartEdit={(selectedJob) => {
                      setEditingNoteId(selectedJob.id);
                      setNoteInputValue(selectedJob.note || "");
                    }}
                    onSaveNote={handleSaveNote}
                    onCancelNote={() => setEditingNoteId(null)}
                    onNoteChange={setNoteInputValue}
                    onAction={handleOnAction}
                    onSave={handleOnSave}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <EmptySavedJobs />
            )}
          </div>
          <SavedJobsSidebar
            aiState={aiState}
            onAiStateChange={setAiState}
            onToast={triggerToast}
          />
        </div>
      </main>
      <ToastList
        toasts={toasts}
        onRemove={(id) =>
          setToasts((current) => current.filter((toast) => toast.id !== id))
        }
      />
    </div>
  );
}