// src/features/candidate/hooks/useAiChatQuery.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  fetchConversationsRequest,
  fetchConversationRequest,
  createConversationRequest,
  sendMessageRequest,
  deleteConversationRequest,
  normalizeConversationsResponse,
  normalizeConversationWithMessages,
  normalizeSendMessageResponse,
} from "@/features/candidate/api/aiChat.api";
import { candidateKeys } from "@/features/candidate/constants/candidate.query-keys";
import { normalizeApiError } from "@/features/auth/hooks/useApiMutation";
import { selectUserRole } from "@/features/auth/store/auth.selectors";

/**
 * Conversations list query.
 */
export const useConversationsQuery = (options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.aiChat.conversations(),
    enabled: role === "candidate",
    queryFn: async () => {
      try {
        const response = await fetchConversationsRequest();
        return normalizeConversationsResponse(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 30_000,
    retry: 1,
    ...options,
  });
};

/**
 * Single conversation with messages query.
 *
 * @param {string} conversationId - Conversation ID
 * @param {Object} options - Additional useQuery options
 */
export const useConversationQuery = (conversationId, options = {}) => {
  const role = useSelector(selectUserRole);

  return useQuery({
    queryKey: candidateKeys.aiChat.conversation(conversationId),
    enabled: role === "candidate" && !!conversationId,
    queryFn: async () => {
      try {
        const response = await fetchConversationRequest(conversationId);
        return normalizeConversationWithMessages(response);
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    staleTime: 0, // Always fresh for active conversation
    retry: 1,
    ...options,
  });
};

/**
 * Create conversation mutation.
 */
export const useCreateConversationMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const _role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async (payload) => {
      const response = await createConversationRequest(payload);
      return response?.data ?? response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.aiChat.conversations() });
      // If we got a conversation back, set it in cache
      if (data?.id) {
        queryClient.setQueryData(candidateKeys.aiChat.conversation(data.id), {
          ...data,
          messages: [],
        });
      }
    },
    ...options,
  });
};

/**
 * Send message mutation.
 * Returns the AI response message.
 */
export const useSendMessageMutation = (options = {}) => {
  const queryClient = useQueryClient();
  // Named `_role` to silence the unused-var warning, but onMutate still read
  // `role` — so the guard below threw a ReferenceError before it could check
  // anything, and the optimistic update never ran. One name, as intended.
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async ({ conversationId, content, context }) => {
      const response = await sendMessageRequest(conversationId, { content, context });
      return normalizeSendMessageResponse(response);
    },
    onMutate: async ({ conversationId, content }) => {
      if (role !== "candidate") return;

      await queryClient.cancelQueries({ queryKey: candidateKeys.aiChat.conversation(conversationId) });

      const previousConversation = queryClient.getQueryData(candidateKeys.aiChat.conversation(conversationId));

      // Optimistically add user message
      const optimisticUserMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        sources: [],
      };

      queryClient.setQueryData(candidateKeys.aiChat.conversation(conversationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, optimisticUserMessage],
        };
      });

      return { previousConversation };
    },
    onError: (error, variables, context) => {
      if (context?.previousConversation) {
        queryClient.setQueryData(candidateKeys.aiChat.conversation(variables.conversationId), context.previousConversation);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.aiChat.conversation(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.aiChat.conversations() });
    },
    ...options,
  });
};

/**
 * Delete conversation mutation.
 */
export const useDeleteConversationMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const _role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: async (conversationId) => {
      await deleteConversationRequest(conversationId);
      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.removeQueries({ queryKey: candidateKeys.aiChat.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.aiChat.conversations() });
    },
    ...options,
  });
};