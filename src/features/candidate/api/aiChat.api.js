// src/features/candidate/api/aiChat.api.js
import { api } from "@/services/axios/axiosInstance";

const unwrapServerData = (response) => response?.data?.data ?? response?.data ?? response;

/**
 * GET /api/mentor/conversations
 * Returns: { data: Conversation[] }
 */
export const fetchConversationsRequest = () =>
  api.get("/api/mentor/conversations").then(unwrapServerData);

/**
 * POST /api/mentor/conversations
 * Body: { title?, context? }
 * Returns: { data: Conversation }
 */
export const createConversationRequest = (payload) =>
  api.post("/api/mentor/conversations", payload).then((res) => res.data);

/**
 * GET /api/mentor/conversations/{conversationId}
 * Returns: { data: ConversationWithMessages }
 */
export const fetchConversationRequest = (conversationId) =>
  api.get(`/api/mentor/conversations/${conversationId}`).then(unwrapServerData);

/**
 * POST /api/mentor/conversations/{conversationId}/messages
 * Body: { content, context? }
 * Returns: { data: Message } - AI response
 */
export const sendMessageRequest = (conversationId, payload) =>
  api.post(`/api/mentor/conversations/${conversationId}/messages`, payload).then((res) => res.data);

/**
 * DELETE /api/mentor/conversations/{conversationId}
 * Returns: { data: { deleted: true } }
 */
export const deleteConversationRequest = (conversationId) =>
  api.delete(`/api/mentor/conversations/${conversationId}`).then((res) => res.data);

/**
 * GET /api/mentor/context-preview
 * Returns: { data: ContextPreview } - Preview of the candidate context used by AI mentor
 */
export const fetchContextPreviewRequest = () =>
  api.get("/api/mentor/context-preview").then(unwrapServerData);

/**
 * Normalize conversation list item
 */
export const normalizeConversation = (item) => ({
  id: item.id,
  title: item.title ?? "New Conversation",
  createdAt: item.createdAt ?? item.created_at,
  updatedAt: item.updatedAt ?? item.updated_at,
  messageCount: item.messageCount ?? item.message_count ?? 0,
  lastMessage: item.lastMessage ?? item.last_message,
});

/**
 * Normalize conversations response
 */
export const normalizeConversationsResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return [];
  const conversations = Array.isArray(data) ? data : data.data ?? data.items ?? [];
  return conversations.map(normalizeConversation);
};

/**
 * Normalize conversation with messages
 */
export const normalizeConversationWithMessages = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;
  return {
    ...normalizeConversation(data),
    messages: Array.isArray(data.messages) ? data.messages.map(normalizeMessage) : [],
  };
};

/**
 * Normalize message
 */
export const normalizeMessage = (msg) => ({
  id: msg.id,
  role: msg.role, // 'user' | 'assistant'
  content: msg.content,
  createdAt: msg.createdAt ?? msg.created_at,
  sources: Array.isArray(msg.sources) ? msg.sources.map(normalizeSource) : [],
});

/**
 * Normalize source
 */
export const normalizeSource = (source) => ({
  type: source.type, // 'job' | 'skill' | 'task' | 'phase' | 'roadmap'
  id: source.id,
  label: source.label,
  url: source.url,
});

/**
 * Normalize send message response
 */
export const normalizeSendMessageResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;
  return normalizeMessage(data);
};

/**
 * Normalize context preview response
 */
export const normalizeContextPreview = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;
  return {
    profile: data.profile ?? {},
    careerPreferences: data.careerPreferences ?? {},
    applications: data.applications ?? [],
    savedJobs: data.savedJobs ?? [],
    skillGaps: data.skillGaps ?? [],
    roadmap: data.roadmap ?? null,
  };
};