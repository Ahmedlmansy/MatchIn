import React from 'react'
import RoadmapPhaseHeader from './components/RoadmapPhaseHeader'
import PhaseSkillsCard from './components/PhaseSkillsCard'
import MilestonesCard from './components/MilestonesCard'
import WeeklyTasksCard from './components/WeeklyTasksCard'

export default function RoadmapDetailsPage() {
  return (
    <div>
      <RoadmapPhaseHeader />
      <PhaseSkillsCard />
      <MilestonesCard />
      <WeeklyTasksCard/>
    </div>
  )
}
