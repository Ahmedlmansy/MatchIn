import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import UserDashboardHeader from "../components/Overview/UserDashboardHeader";
import PipelineOverviewCard from "../components/Overview/PipelineOverviewCard";
import RecommendedJobsCard from "../components/Overview/RecommendedJobsCard";
import RoadmapCard from "../components/Overview/RoadmapCard";
import AIMentorCard from "../components/Overview/AIMentorCard";
import SavedJobsCard from "../components/Overview/SavedJobsCard";
import NotificationsCard from "../components/Overview/NotificationsCard";
import CompetencyRadarCard from "../components/Overview/CompetencyRadarCard";
import PrioritySkillGapsCard from "../components/Overview/PrioritySkillGapsCard";
import { useDashboardSummaryQuery } from "@/features/candidate/hooks/useDashboardSummaryQuery";

export default function Overview() {
  const { t } = useTranslation("dashboard");
  const {
    isLoading,
    isError,
    error,
    recommendedJobs,
    savedJobs,
    notifications,
    roadmap,
    skillGaps,
    userName,
    competencyData,
    refetch,
  } = useDashboardSummaryQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <UserDashboardHeader userName={t("overview.loading.user")} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DashboardSkeleton />
          <DashboardSkeleton />
          <DashboardSkeleton />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <DashboardSkeleton />
          <DashboardSkeleton />
          <DashboardSkeleton />
          <DashboardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 text-center py-12 rounded-2xl border border-border bg-surface">
          <p className="text-muted mb-4">Failed to load dashboard</p>
          <p className="text-xs text-muted mb-4">{error?.message ?? "Unknown error"}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <UserDashboardHeader userName={userName} />
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <PipelineOverviewCard />
        <RecommendedJobsCard
          jobs={recommendedJobs}
          isLoading={false}
          onApply={(job) => console.log("Apply to", job.id)}
          onBookmark={(job) => console.log("Bookmark", job.id)}
        />
        <PrioritySkillGapsCard skills={skillGaps} />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <CompetencyRadarCard data={competencyData} onRecalibrate={() => console.log("Recalibrate")} />
        <AIMentorCard />
        <RoadmapCard
          phaseTitle={roadmap.phaseTitle}
          progressPercent={roadmap.progressPercent}
          tasksLeftLabel={roadmap.tasksLeftLabel}
          isPartial={roadmap.isPartial}
        />
        <NotificationsCard notifications={notifications} />
        <SavedJobsCard jobs={savedJobs} isPartial={savedJobs.length === 0} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm animate-pulse"
    >
      <div className="h-4 w-1/4 bg-border rounded mb-4" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-border rounded" />
        <div className="h-16 w-full bg-border rounded" />
        <div className="h-16 w-full bg-border rounded" />
      </div>
    </motion.div>
  );
}