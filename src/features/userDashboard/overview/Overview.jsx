import React from 'react'
import UserDashboardHeader from './components/UserDashboardHeader';
import PipelineOverviewCard from './components/PipelineOverviewCard';
import RecommendedJobsCard from './components/RecommendedJobsCard';
import RoadmapCard from './components/RoadmapCard';
import AIMentorCard from './components/AIMentorCard';
import SavedJobsCard from './components/SavedJobsCard';
import NotificationsCard from './components/NotificationsCard';
import CompetencyRadarCard from './components/CompetencyRadarCard';
import PrioritySkillGapsCard from './components/PrioritySkillGapsCard';

export default function Overview() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-3">
        <UserDashboardHeader />
      </div>
      <div className="lg:col-span-2 md:col-span-3 flex flex-col gap-3">
        <PipelineOverviewCard />
        <RecommendedJobsCard />
        <PrioritySkillGapsCard />
      </div>
      <div className="lg:col-span-1 md:col-span-3 flex flex-col gap-3">
        <CompetencyRadarCard />
        <AIMentorCard />
        <RoadmapCard />
        <NotificationsCard />
        <SavedJobsCard />
      </div>
    </div>
  );
}
