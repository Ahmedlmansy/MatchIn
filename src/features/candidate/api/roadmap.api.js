// src/features/candidate/api/roadmap.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * GET /api/roadmaps
 * Returns: { data: Roadmap } - user's current roadmap
 */
export const fetchRoadmapRequest = () =>
  api.get("/api/roadmaps").then(unwrapServerData);

/**
 * GET /api/roadmaps/{roadmap}
 * Returns: { data: RoadmapDetails } - detailed roadmap for a role
 */
export const fetchRoadmapDetailsRequest = (roadmapId) =>
  api.get(`/api/roadmaps/${roadmapId}`).then(unwrapServerData);

/**
 * POST /api/roadmaps
 * Body: { target_role, role_family, skill_gaps[] }
 * Returns: { data: { id, target_role, completion_percentage, milestones[] } }
 */
export const generateRoadmapRequest = (payload) =>
  api.post("/api/roadmaps", payload).then((res) => res.data);

/**
 * POST /api/roadmaps/{roadmap}/refresh
 * Adjusts ongoing milestone task lists when a candidate targets new jobs.
 */
export const refreshRoadmapRequest = (roadmapId) =>
  api.post(`/api/roadmaps/${roadmapId}/refresh`).then((res) => res.data);

/**
 * GET /api/roadmaps/generation/{generationId}
 * Poll for generation status (legacy - generation is now synchronous)
 * Returns: { data: { status: "processing" | "completed" | "failed", roadmap?: Roadmap } }
 */
export const fetchGenerationStatusRequest = (generationId) =>
  api.get(`/api/roadmaps/generation/${generationId}`).then(unwrapServerData);

/**
 * PATCH /api/roadmaps/tasks/{roadmapTask}/complete
 * Body: { status: "completed", notes }
 * Returns: { data: { task: UpdatedTask } }
 */
export const updateTaskCompletionRequest = (taskId, payload) =>
  api.patch(`/api/roadmaps/tasks/${taskId}/complete`, payload).then((res) => res.data);

/**
 * Normalize roadmap summary (for list/overview)
 * Backend response (new schema):
 * {
 *   status: "success",
 *   data: {
 *     id: 18,
 *     target_role: "Senior Backend Architect",
 *     completion_percentage: 0,
 *     milestones: [
 *       {
 *         id: 101,
 *         title: "Phase 1: Cloud & Container Fundamentals",
 *         order: 1,
 *         tasks: [
 *           {
 *             id: 201,
 *             title: "Master Docker Containerization",
 *             description: "Build multi-stage Dockerfiles and container networks.",
 *             estimated_hours: 15,
 *             status: "pending"
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 */
export const normalizeRoadmap = (data) => {
  if (!data) return null;
  
  // Handle both old schema (with phases) and new schema (milestones directly)
  const milestones = data.milestones ?? data.phases?.flatMap((p, i) => 
    (p.milestones || []).map(m => ({ ...m, phaseOrder: p.phaseNumber ?? p.order ?? i + 1 }))
  ) ?? [];

  const tasks = milestones.flatMap(m => m.tasks || []);
  const completedTasks = tasks.filter(t => (t.status === "completed") || t.done).length;
  const totalTasks = tasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (data.completion_percentage ?? data.overallProgress ?? 0);

  return {
    id: data.id,
    targetRole: data.targetRole ?? data.target_role,
    targetJobId: data.targetJobId ?? data.target_job_id,
    overallProgress,
    totalPhases: data.milestones?.length ?? data.totalPhases ?? data.total_phases ?? 0,
    completedTasks,
    totalTasks,
    estimatedWeeksRemaining: data.estimatedWeeksRemaining ?? data.estimated_weeks_remaining ?? 0,
    currentPhase: data.currentPhase ?? data.current_phase,
    // New schema uses milestones directly
    milestones: milestones.map(normalizeMilestone),
    // Keep phases for backward compatibility (derived from milestones)
    phases: milestones.map((m, i) => normalizePhase({ ...m, phaseNumber: i + 1 })),
    prioritySkillGaps: Array.isArray(data.prioritySkillGaps) ? data.prioritySkillGaps : (data.skill_gaps?.map(s => ({ name: s, priority: "high", reason: "Identified gap" })) ?? []),
    weeklyTasks: Array.isArray(data.weeklyTasks) ? data.weeklyTasks.map(normalizeWeeklyTask) : [],
    generatedAt: data.generatedAt ?? data.generated_at,
    updatedAt: data.updatedAt ?? data.updated_at,
  };
};

/**
 * Normalize phase (for backward compatibility - derived from milestones)
 */
export const normalizePhase = (phase) => ({
  id: phase.id,
  phaseNumber: phase.phaseNumber ?? phase.order ?? phase.phase_number,
  title: phase.title,
  goal: phase.goal,
  completion: phase.completion ?? phase.completion_percentage ?? phase.completion ?? 0,
  tasksCompleted: phase.tasksCompleted ?? phase.tasks?.filter(t => (t.status === "completed") || t.done).length ?? 0,
  totalTasks: phase.totalTasks ?? phase.tasks?.length ?? phase.total_tasks ?? 0,
  skills: Array.isArray(phase.skills) ? phase.skills : [],
  milestones: phase.milestones ?? [phase], // self-reference for compatibility
  tasks: Array.isArray(phase.tasks) ? phase.tasks.map(normalizeTask) : [],
});

/**
 * Normalize milestone (new schema: milestones directly contain tasks)
 */
export const normalizeMilestone = (milestone) => ({
  id: milestone.id,
  phaseNumber: milestone.order ?? milestone.phaseNumber ?? milestone.phase_number,
  title: milestone.title,
  goal: milestone.goal ?? milestone.description,
  completion: milestone.completion_percentage ?? milestone.completion ?? 0,
  tasksCompleted: milestone.tasks?.filter(t => (t.status === "completed") || t.done).length ?? milestone.tasksCompleted ?? 0,
  totalTasks: milestone.tasks?.length ?? milestone.totalTasks ?? milestone.total_tasks ?? 0,
  skills: Array.isArray(milestone.skills) ? milestone.skills : [],
  milestones: [milestone], // self-reference for compatibility
  tasks: Array.isArray(milestone.tasks) ? milestone.tasks.map(normalizeTask) : [],
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
  done: (task.status === "completed") || (task.done ?? false),
  completedDate: task.completedDate ?? task.completed_date ?? ((task.status === "completed") ? new Date().toISOString().split("T")[0] : null),
  phaseId: task.phaseId ?? task.phase_id,
  estimatedHours: task.estimated_hours ?? task.estimatedHours,
  status: task.status,
});

/**
 * Normalize weekly task
 */
export const normalizeWeeklyTask = (task) => ({
  id: task.id,
  title: task.title,
  targetSkill: task.targetSkill ?? task.target_skill,
  done: (task.status === "completed") || (task.done ?? false),
  completedDate: task.completedDate ?? task.completed_date ?? ((task.status === "completed") ? new Date().toISOString().split("T")[0] : null),
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