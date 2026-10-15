// src/features/candidate/api/aiChat.api.js
import { api } from "@/services/axios/axiosInstance";

/**
 * Backend wraps payloads as { status, message, data }.
 * Always return the inner `data` so callers/hooks get the real object
 * (e.g. `created.id`, not `created.data.id`).
 */
const unwrapServerData = (response) => {
  const body = response?.data ?? response;
  return body?.data ?? body;
};

/** GET /api/mentor/conversations */
export const fetchConversationsRequest = () =>
  api.get("/api/mentor/conversations").then(unwrapServerData);

/**
 * POST /api/mentor/conversations
 * Body: { title?, job_post_id? }
 */
export const createConversationRequest = (payload) =>
  api.post("/api/mentor/conversations", payload).then(unwrapServerData);

/** GET /api/mentor/conversations/{conversationId} */
export const fetchConversationRequest = (conversationId) =>
  api.get(`/api/mentor/conversations/${conversationId}`).then(unwrapServerData);

/**
 * POST /api/mentor/conversations/{conversationId}/messages
 * Backend body:  { message }
 * Backend reply: { user_message, mentor_reply }
 * We accept `message` or `content` from callers and always send `message`.
 */
export const sendMessageRequest = (conversationId, payload = {}) => {
  const message = payload.message ?? payload.content ?? "";
  return api
    .post(`/api/mentor/conversations/${conversationId}/messages`, { message })
    .then(unwrapServerData);
};

/** DELETE /api/mentor/conversations/{conversationId} */
export const deleteConversationRequest = (conversationId) =>
  api
    .delete(`/api/mentor/conversations/${conversationId}`)
    .then(unwrapServerData);

/** GET /api/mentor/context-preview */
export const fetchContextPreviewRequest = () =>
  api.get("/api/mentor/context-preview").then(unwrapServerData);

/* ───────────────────────── Normalizers ───────────────────────── */

export const normalizeSource = (source) => ({
  type: source.type, // 'job' | 'skill' | 'task' | 'phase' | 'roadmap'
  id: source.id,
  label: source.label,
  url: source.url,
});

/**
 * Backend uses `sender` ("user" | "assistant"); older code used `role`.
 */
export const normalizeMessage = (msg) => ({
  id: msg.id,
  role: msg.role ?? msg.sender ?? "assistant",
  content: msg.content ?? msg.message ?? "",
  createdAt: msg.createdAt ?? msg.created_at,
  sources: Array.isArray(msg.sources) ? msg.sources.map(normalizeSource) : [],
});

export const normalizeConversation = (item) => ({
  id: item.id,
  title: item.title ?? "New Conversation",
  createdAt: item.createdAt ?? item.created_at,
  updatedAt: item.updatedAt ?? item.updated_at,
  messageCount: item.messageCount ?? item.message_count ?? 0,
  lastMessage: item.lastMessage ?? item.last_message,
});

export const normalizeConversationsResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return [];
  const list = Array.isArray(data)
    ? data
    : (data.data ?? data.items ?? data.conversations ?? []);
  return list.map(normalizeConversation);
};

export const normalizeConversationWithMessages = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;
  return {
    ...normalizeConversation(data),
    messages: Array.isArray(data.messages)
      ? data.messages.map(normalizeMessage)
      : [],
  };
};

/**
 * Send-message reply is { user_message, mentor_reply }.
 * Returns the assistant message, with the saved user message attached as `userMessage`.
 */
export const normalizeSendMessageResponse = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;

  const reply = data.mentor_reply ?? data.mentorReply;
  if (reply) {
    const user = data.user_message ?? data.userMessage;
    return {
      ...normalizeMessage(reply),
      userMessage: user
        ? normalizeMessage({ ...user, sender: user.sender ?? "user" })
        : null,
    };
  }
  // Already a single message (or already normalized)
  return normalizeMessage(data);
};

export const normalizeContextPreview = (response) => {
  const data = unwrapServerData(response);
  if (!data) return null;
  return {
    profile: data.profile ?? {},
    careerPreferences: data.careerPreferences ?? data.career_preferences ?? {},
    applications: data.applications ?? [],
    savedJobs: data.savedJobs ?? data.saved_jobs ?? [],
    skillGaps: data.skillGaps ?? data.skill_gaps ?? [],
    roadmap: data.roadmap ?? null,
  };
};
