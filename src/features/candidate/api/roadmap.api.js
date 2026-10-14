// src/features/candidate/api/roadmap.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * GET /api/roadmap
 * Returns: { data: Roadmap } - user's current roadmap
 */
export const fetchRoadmapRequest = () =>
  api.get("/api/roadmap").then(unwrapServerData);

/**
 * GET /api/roadmap/{roleId}
 * Returns: { data: RoadmapDetails } - detailed roadmap for a role
 */
export const fetchRoadmapDetailsRequest = (roleId) =>
  api.get(`/api/roadmap/${roleId}`).then(unwrapServerData);

/**
 * POST /api/roadmap/generate
 * Body: { targetRole, targetJobId }
 * Returns: { data: { generationId, status: "processing" } }
 */
export const generateRoadmapRequest = (payload) =>
  api.post("/api/roadmap/generate", payload).then((res) => res.data);

/**
 * GET /api/roadmap/generation/{generationId}
 * Poll for generation status
 * Returns: { data: { status: "processing" | "completed" | "failed", roadmap?: Roadmap } }
 */
export const fetchGenerationStatusRequest = (generationId) =>
  api.get(`/api/roadmap/generation/${generationId}`).then(unwrapServerData);

/**
 * PATCH /api/roadmap/tasks/{taskId}/complete
 * Body: { completed: boolean }
 * Returns: { data: { task: UpdatedTask } }
 */
export const updateTaskCompletionRequest = (taskId, completed) =>
  api.patch(`/api/roadmap/tasks/${taskId}/complete`, { completed }).then((res) => res.data);

/**
 * POST /api/roadmap/refresh
 * Body: { targetRole }
 * Returns: { data: { generationId, status: "processing" } }
 */
export const refreshRoadmapRequest = (targetRole) =>
  api.post("/api/roadmap/refresh", { targetRole }).then((res) => res.data);

/**
 * Normalize roadmap summary (for list/overview)
 */
export const normalizeRoadmap = (data) => {
  if (!data) return null;
  return {
    id: data.id,
    targetRole: data.targetRole ?? data.target_role,
    targetJobId: data.targetJobId ?? data.target_job_id,
    overallProgress: data.overallProgress ?? data.overall_progress ?? 0,
    totalPhases: data.totalPhases ?? data.total_phases ?? 0,
    completedTasks: data.completedTasks ?? data.completed_tasks ?? 0,
    totalTasks: data.totalTasks ?? data.total_tasks ?? 0,
    estimatedWeeksRemaining: data.estimatedWeeksRemaining ?? data.estimated_weeks_remaining ?? 0,
    currentPhase: data.currentPhase ?? data.current_phase,
    phases: Array.isArray(data.phases) ? data.phases.map(normalizePhase) : [],
    prioritySkillGaps: Array.isArray(data.prioritySkillGaps) ? data.prioritySkillGaps : [],
    weeklyTasks: Array.isArray(data.weeklyTasks) ? data.weeklyTasks.map(normalizeWeeklyTask) : [],
    generatedAt: data.generatedAt ?? data.generated_at,
    updatedAt: data.updatedAt ?? data.updated_at,
  };
};

/**
 * Normalize phase
 */
export const normalizePhase = (phase) => ({
  id: phase.id,
  phaseNumber: phase.phaseNumber ?? phase.phase_number,
  title: phase.title,
  goal: phase.goal,
  completion: phase.completion ?? 0,
  tasksCompleted: phase.tasksCompleted ?? phase.tasks_completed ?? 0,
  totalTasks: phase.totalTasks ?? phase.total_tasks ?? 0,
  skills: Array.isArray(phase.skills) ? phase.skills : [],
  milestones: Array.isArray(phase.milestones) ? phase.milestones : [],
  tasks: Array.isArray(phase.tasks) ? phase.tasks.map(normalizeTask) : [],
});

/**
 * Normalize task
 */
export const normalizeTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  why: task.why,
  outcome: task.outcome,
  targetSkill: task.targetSkill ?? task.target_skill,
  done: task.done ?? false,
  completedDate: task.completedDate ?? task.completed_date,
  phaseId: task.phaseId ?? task.phase_id,
});

/**
 * Normalize weekly task
 */
export const normalizeWeeklyTask = (task) => ({
  id: task.id,
  title: task.title,
  targetSkill: task.targetSkill ?? task.target_skill,
  done: task.done ?? false,
  completedDate: task.completedDate ?? task.completed_date,
  description: task.description,
  why: task.why,
  outcome: task.outcome,
  phaseNumber: task.phaseNumber ?? task.phase_number,
});

/**
 * Normalize roadmap details (extended)
 */
export const normalizeRoadmapDetails = (data) => {
  const base = normalizeRoadmap(data);
  if (!base) return null;
  return {
    ...base,
    // Extended fields for details page
    baseline: data.baseline,
    targetRoleDetails: data.targetRoleDetails ?? data.target_role_details,
  };
};

/**
 * Normalize skill gap
 */
export const normalizeSkillGap = (gap) => ({
  id: gap.id,
  name: gap.name,
  reason: gap.reason,
  priority: gap.priority ?? "medium",
});