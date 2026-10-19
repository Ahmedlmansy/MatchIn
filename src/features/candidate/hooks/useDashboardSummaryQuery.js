// src/features/candidate/hooks/useDashboardSummaryQuery.js
import { useSelector } from "react-redux";
import { useJobsQuery } from "./useJobsQuery";
import { useSavedJobsQuery } from "./useJobsQuery";
import { useNotificationsQuery } from "./useNotificationsQuery";
import { useRoadmapQuery } from "./useRoadmapQuery";
import { useProfileQuery } from "./useProfileQuery";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * Dashboard summary hook that aggregates data from multiple feature queries.
 * Uses existing queries to avoid duplicate API calls.
 * Each query handles its own loading/error/empty states independently.
 */
export const useDashboardSummaryQuery = (_options = {}) => {
  const role = useSelector(selectUserRole);
  const enabled = role === "candidate";

  // Fetch jobs (for recommended jobs)
  const jobsQuery = useJobsQuery(
    { limit: 5, sortBy: "match" },
    { enabled, staleTime: 30_000 }
  );

  // Fetch saved jobs (for saved jobs card)
  const savedJobsQuery = useSavedJobsQuery(
    { limit: 5, sortBy: "bestMatch" },
    { enabled, staleTime: 30_000 }
  );

  // Fetch notifications (for notifications card)
  const notificationsQuery = useNotificationsQuery(
    { limit: 5 },
    { enabled, staleTime: 30_000 }
  );

  // Fetch roadmap (for roadmap card)
  const roadmapQuery = useRoadmapQuery({ enabled, staleTime: 60_000 });

  // Fetch profile (for user name in header)
  const profileQuery = useProfileQuery({ enabled, staleTime: 60_000 });

  // Transform data for overview components
  const recommendedJobs = jobsQuery.data?.jobs?.slice(0, 3).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salaryRange,
    matchScore: job.matchPercent,
    matchTone: job.matchPercent >= 90 ? "success" : "accent",
    icon: "Briefcase",
    iconTheme: job.matchPercent >= 90 ? "gradient" : "neutral",
    tags: job.tags?.slice(0, 3) ?? [],
    badgeText: job.matchPercent >= 95 ? "Top Match" : job.matchPercent >= 90 ? "High Match" : null,
  })) ?? [];

  const savedJobs = savedJobsQuery.data?.jobs?.slice(0, 2).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
  })) ?? [];

  const notifications = notificationsQuery.data?.notifications?.slice(0, 3).map((n) => ({
    id: n.id,
    message: n.description || n.title,
  })) ?? [];

  const roadmap = roadmapQuery.data ? {
    phaseTitle: roadmapQuery.data.phases?.[0]?.title ?? "Phase 1: Foundations",
    progressPercent: roadmapQuery.data.overallProgress ?? 0,
    tasksLeftLabel: roadmapQuery.data.weeklyTasks 
      ? `${roadmapQuery.data.weeklyTasks.filter((t) => !t.done).length} task${roadmapQuery.data.weeklyTasks.filter((t) => !t.done).length !== 1 ? "s" : ""} left this week`
      : "No tasks",
    isPartial: !roadmapQuery.data,
  } : {
    isPartial: true,
  };

  const skillGaps = roadmapQuery.data?.prioritySkillGaps?.map((gap) => ({
    id: gap.id ?? gap.name,
    name: gap.name,
    level: gap.priority ?? "medium",
  })) ?? [];

  const userName = profileQuery.data?.jobTitle 
    ? profileQuery.data.jobTitle.split(" ")[0] 
    : profileQuery.data?.user?.name?.split(" ")[0] 
    ?? "User";

  // Competency radar data (mock for now, would come from profile/skills API)
  const competencyData = {
    overallScore: roadmapQuery.data?.overallProgress ?? 72,
    secondaryScore: 65,
    comparisonLabel: "+5% vs last week",
    benchmarkLabel: "Industry benchmark: 68%",
    skills: [
      { label: "Frontend Architecture", value: 85, color: "primary" },
      { label: "TypeScript Mastery", value: 90, color: "success" },
      { label: "System Design", value: 55, color: "accent" },
      { label: "Testing & CI/CD", value: 65, color: "primary" },
      { label: "Performance Optimization", value: 70, color: "success" },
    ],
  };

  return {
    // Raw query results for independent error handling
    jobsQuery,
    savedJobsQuery,
    notificationsQuery,
    roadmapQuery,
    profileQuery,
    
    // Transformed data for components
    recommendedJobs,
    savedJobs,
    notifications,
    roadmap,
    skillGaps,
    userName,
    competencyData,
    
    // Refetch all
    refetch: () => {
      jobsQuery.refetch();
      savedJobsQuery.refetch();
      notificationsQuery.refetch();
      roadmapQuery.refetch();
      profileQuery.refetch();
    },
  };
};