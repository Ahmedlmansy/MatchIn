import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import JobDetailsContent from "../components/JobsDetails/JobDetailsContent";
import JobDetailsModals from "../components/JobsDetails/JobDetailsModals";
import JobDetailsStateViews from "../components/JobsDetails/JobDetailsStateViews";
import JobModalViews from "../components/JobsPage/JobModalViews";
import { useJobDetailsQuery } from "@/features/candidate/hooks/useJobsQuery";
import { useApplyJobMutation } from "@/features/candidate/hooks/useJobMutations";
import { useSaveJobMutation } from "@/features/candidate/hooks/useJobMutations";

export default function JobDetailsPage() {
  const { jobId } = useParams();

  const [matchState, setMatchState] = useState("not_analyzed");
  const [isInRoadmap, setIsInRoadmap] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [applyStep, setApplyStep] = useState("form");
  const [toast, setToast] = useState(null);
  const [mentorMessages, setMentorMessages] = useState([]);

  const applicationForm = useForm({
    defaultValues: { cv: "", authorized: "", startDate: "" },
  });

  const { data: job, isLoading, isError, refetch } = useJobDetailsQuery(jobId);
  const applyMutation = useApplyJobMutation();
  const saveMutation = useSaveJobMutation();

  // Initialize mentor messages when job loads
  useEffect(() => {
    if (job) {
      setMentorMessages([
        {
          sender: "mentor",
          text: `I've reviewed ${job.title} at ${job.company}. Your profile shows strong alignment with the core requirements. Want a focused prep plan?`,
        },
      ]);
    }
  }, [job]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  function handlePageState(stateKey) {
    const matchStates = [
      "not_analyzed",
      "analyzing",
      "success",
      "low_confidence",
      "missing_context",
      "ai_failure",
    ];
    if (matchStates.includes(stateKey)) {
      setMatchState(stateKey);
      if (stateKey === "analyzing") {
        setTimeout(() => setMatchState("success"), 2500);
      }
      return;
    }
    if (stateKey === "retry") {
      refetch();
      return;
    }
  }

  function openApplication() {
    applicationForm.reset();
    setApplyStep("form");
    setActiveModal("apply");
  }

  async function submitApplication(data) {
    setApplyStep("submitting");
    try {
      await applyMutation.mutateAsync({ jobId: job.id, payload: data });
      setApplyStep("success");
    } catch {
      setApplyStep("servererror");
    }
  }

  function askMentor(question) {
    setMentorMessages((messages) => [
      ...messages,
      { sender: "user", text: question },
      {
        sender: "mentor",
        text: `Great question about ${job?.title}. Based on the requirements, I'd recommend focusing on the core skills mentioned. Want me to elaborate on any specific area?`,
      },
    ]);
  }

  function handleToggleBookmark() {
    if (!job) return;
    const currentlySaved = job.isBookmarked ?? false;
    saveMutation.mutate({ jobId: job.id, saved: currentlySaved });
  }

  function handleRoadmapToggle() {
    setIsInRoadmap((value) => !value);
    showToast(
      isInRoadmap
        ? "Removed from your roadmap"
        : "Added to your roadmap — AI will generate a skill plan",
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans text-ink antialiased">
        <main className="mx-auto w-full max-w-340 flex-1 px-6 py-8">
          <JobDetailsStateViews pageState="loading" onStateChange={handlePageState} />
        </main>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-background font-sans text-ink antialiased">
        <main className="mx-auto w-full max-w-340 flex-1 px-6 py-8">
          <JobDetailsStateViews
            pageState="not_found"
            onStateChange={handlePageState}
          />
        </main>
      </div>
    );
  }

  const isBookmarked = job.isBookmarked ?? false;

  return (
    <div className="min-h-screen bg-background font-sans text-ink antialiased">
      <main className="mx-auto w-full max-w-340 flex-1 px-6 py-8">
        <JobDetailsStateViews
          pageState={job.expired ? "expired_stale" : "loaded"}
          onStateChange={handlePageState}
        />
        <JobDetailsContent
          isExpired={job.expired ?? false}
          isBookmarked={isBookmarked}
          matchState={matchState}
          isInRoadmap={isInRoadmap}
          onApply={openApplication}
          onAnalysis={() => showToast("Full market compensation analysis loaded")}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            showToast("Job link copied to clipboard!");
          }}
          onToggleBookmark={handleToggleBookmark}
          onRoadmapToggle={handleRoadmapToggle}
          onOpenMentor={() => setActiveModal("mentor")}
          onAnalyze={() => handlePageState("analyzing")}
          onSync={() => showToast("Connecting GitHub & portfolio analyzer...")}
          onRetry={() => refetch()}
          onToast={showToast}
        />
      </main>

      {activeModal === "apply" && (
        <JobModalViews
          view={applyStep}
          activeJob={{ title: job.title, company: job.company }}
          form={applicationForm}
          onClose={() => setActiveModal(null)}
          onRetry={() => setApplyStep("form")}
          onSubmit={submitApplication}
        />
      )}
      <JobDetailsModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        mentorMessages={mentorMessages}
        onAskMentorQuestion={askMentor}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 inset-e-6 z-50 rounded-xl border border-border bg-primary px-4 py-3 text-primary-foreground shadow-lg"
          >
            <p className="text-xs font-medium">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}