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
  const {
    jobsQuery,
    savedJobsQuery,
    notificationsQuery,
    roadmapQuery,
    profileQuery,
    recommendedJobs,
    savedJobs,
    notifications,
    roadmap,
    skillGaps,
    userName,
    competencyData,
  } = useDashboardSummaryQuery();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <UserDashboardHeader userName={userName} profileQuery={profileQuery} />
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <PipelineOverviewCard />
        <RecommendedJobsCard
          jobs={recommendedJobs}
          jobsQuery={jobsQuery}
          onApply={(job) => console.log("Apply to", job.id)}
          onBookmark={(job) => console.log("Bookmark", job.id)}
        />
        <PrioritySkillGapsCard skills={skillGaps} roadmapQuery={roadmapQuery} />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <CompetencyRadarCard data={competencyData} onRecalibrate={() => console.log("Recalibrate")} roadmapQuery={roadmapQuery} />
        <AIMentorCard />
        <RoadmapCard
          phaseTitle={roadmap.phaseTitle}
          progressPercent={roadmap.progressPercent}
          tasksLeftLabel={roadmap.tasksLeftLabel}
          isPartial={roadmap.isPartial}
          roadmapQuery={roadmapQuery}
        />
        <NotificationsCard notifications={notifications} notificationsQuery={notificationsQuery} />
        <SavedJobsCard jobs={savedJobs} isPartial={savedJobs.length === 0} savedJobsQuery={savedJobsQuery} />
      </div>
    </div>
  );
}