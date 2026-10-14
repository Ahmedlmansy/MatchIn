// src/features/candidate/constants/candidate.query-keys.js
// One query-key factory per domain (convention §4.1). Every candidate query hangs
// off candidateKeys so invalidation can target a whole slice of the candidate area
// without touching unrelated domains.
//
// Query keys are plain nested arrays — react-query hashes them structurally.

export const candidateKeys = {
  all: ["candidate"],

  profile: () => [...candidateKeys.all, "profile"],

  cv: {
    history: () => [...candidateKeys.all, "cv", "history"],
    status: (id) => [...candidateKeys.all, "cv", "status", id],
  },

  jobs: {
    list: (filters) => [...candidateKeys.all, "jobs", "list", filters ?? {}],
    details: (jobId) => [...candidateKeys.all, "jobs", "details", jobId],
    saved: (filters) => [...candidateKeys.all, "jobs", "saved", filters ?? {}],
  },

  applications: (filters) => [...candidateKeys.all, "applications", filters ?? {}],

  roadmap: (roleId) => [...candidateKeys.all, "roadmap", roleId ?? {}],

  notifications: {
    list: (filters) => [...candidateKeys.all, "notifications", "list", filters ?? {}],
  },

  aiChat: {
    conversations: () => [...candidateKeys.all, "aiChat", "conversations"],
    conversation: (conversationId) => [...candidateKeys.all, "aiChat", "conversation", conversationId],
    contextPreview: () => [...candidateKeys.all, "aiChat", "contextPreview"],
  },
};