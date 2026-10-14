// src/features/candidate/hooks/useRoadmapQuery.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchRoadmapRequest,
  fetchRoadmapDetailsRequest,
  generateRoadmapRequest,
  fetchGenerationStatusRequest,
  updateTaskCompletionRequest,
  refreshRoadmapRequest,
  normalizeRoadmap,
  normalizeRoadmapDetails,
} from "@/features/candidate/api/roadmap.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * User's current roadmap query.
 */
export const useRoadmapQuery = (options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.roadmap(),
    enabled: role === "candidate",
    queryFn: async () => {
      try {
        const response = await fetchRoadmapRequest();
        const data = normalizeRoadmap(response);
        return data;
      } catch (error) {
        // If 404, it means no roadmap exists yet - return null instead of throwing
        if (error?.status === 404) return null;
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};

/**
 * Roadmap details query for a specific role.
 *
 * @param {string} roleId - Role ID
 * @param {Object} options - Additional useQuery options
 */
export const useRoadmapDetailsQuery = (roleId, options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.roadmap(roleId),
    enabled: role === "candidate" && !!roleId,
    queryFn: async () => {
      try {
        const response = await fetchRoadmapDetailsRequest(roleId);
        return normalizeRoadmapDetails(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 60_000,
    retry: 1,
    ...options,
  });
};

/**
 * Generate roadmap mutation.
 * Returns generation ID for polling.
 */
export const useGenerateRoadmapMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const _role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async (payload) => {
      const response = await generateRoadmapRequest(payload);
      return response?.data ?? response;
    },
    onSuccess: (data) => {
      // If generation is synchronous, invalidate roadmap query
      if (data?.roadmap) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.roadmap() });
      }
    },
    ...options,
  });
};

/**
 * Poll generation status query.
 */
export const useGenerationStatusQuery = (generationId, options = {}) => {
  const _role = useSelector(selectUserRole);

  return useQuery({
    queryKey: [...candidateKeys.roadmap(), "generation", generationId],
    enabled: _role === "candidate" && !!generationId,
    queryFn: async () => {
      try {
        const response = await fetchGenerationStatusRequest(generationId);
        return response;
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status !== "processing") return false;
      return 2000; // Poll every 2 seconds
    },
    refetchIntervalInBackground: false,
    retry: 1,
    ...options,
  });
};

/**
 * Update task completion mutation.
 * Optimistically updates the task in the cache.
 */
export const useUpdateTaskCompletionMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async ({ taskId, completed }) => {
      const response = await updateTaskCompletionRequest(taskId, completed);
      return response?.data ?? response;
    },
    onMutate: async ({ taskId, completed }) => {
      if (role !== "candidate") return;

      await queryClient.cancelQueries({ queryKey: candidateKeys.roadmap(), exact: false });

      const previousRoadmaps = queryClient.getQueriesData({ queryKey: candidateKeys.roadmap(), exact: false });

      previousRoadmaps.forEach(([queryKey, data]) => {
        if (!data) return;
        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old;
          return updateTaskInRoadmap(old, taskId, completed);
        });
      });

      return { previousRoadmaps };
    },
    onError: (error, variables, context) => {
      if (context?.previousRoadmaps) {
        context.previousRoadmaps.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.roadmap(), exact: false });
    },
    ...options,
  });
};

/**
 * Refresh roadmap mutation.
 */
export const useRefreshRoadmapMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const _role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async (targetRole) => {
      const response = await refreshRoadmapRequest(targetRole);
      return response?.data ?? response;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.roadmap(), exact: false });
    },
    ...options,
  });
};

/**
 * Helper to update a task in the roadmap data structure.
 */
function updateTaskInRoadmap(roadmap, taskId, completed) {
  if (!roadmap) return roadmap;

  const updatePhaseTasks = (phase) => ({
    ...phase,
    tasks: phase.tasks?.map((task) =>
      task.id === taskId ? { ...task, done: completed, completedDate: completed ? new Date().toISOString().split("T")[0] : null } : task
    ) ?? [],
    tasksCompleted: phase.tasks?.filter((t) => t.id === taskId ? completed : t.done).length ?? phase.tasksCompleted,
    completion: phase.totalTasks > 0
      ? Math.round((phase.tasks?.filter((t) => t.id === taskId ? completed : t.done).length ?? phase.tasksCompleted) / phase.totalTasks * 100)
      : phase.completion,
  });

  const updatedPhases = roadmap.phases?.map(updatePhaseTasks) ?? [];

  // Also update weeklyTasks if present
  const updatedWeeklyTasks = roadmap.weeklyTasks?.map((task) =>
    task.id === taskId ? { ...task, done: completed, completedDate: completed ? new Date().toISOString().split("T")[0] : null } : task
  ) ?? roadmap.weeklyTasks;

  const completedTasks = updatedPhases.reduce((sum, p) => sum + (p.tasksCompleted ?? 0), 0);
  const totalTasks = updatedPhases.reduce((sum, p) => sum + (p.totalTasks ?? 0), 0);

  return {
    ...roadmap,
    phases: updatedPhases,
    weeklyTasks: updatedWeeklyTasks,
    completedTasks,
    totalTasks,
    overallProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : roadmap.overallProgress,
  };
}