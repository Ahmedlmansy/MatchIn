// src/features/candidate/constants/candidate.query-keys.js
// One query-key factory per domain (convention §4.1). Every candidate query hangs
// off candidateKeys so invalidation can target a whole slice of the candidate area
// without touching unrelated domains.
//
// Query keys are plain nested arrays — react-query hashes them structurally.

export const candidateKeys = {
  all: ["candidate"],

  profile: () => [...candidateKeys.all, "profile"],

  // Placeholders for the rest of the candidate domain, added as each screen is
  // migrated off its mock data — keeps every key defined in exactly one place.
  savedJobs: (filters) => [...candidateKeys.all, "saved-jobs", filters ?? {}],
  applications: (filters) => [...candidateKeys.all, "applications", filters ?? {}],
  cv: () => [...candidateKeys.all, "cv"],
  roadmap: (roleId) => [...candidateKeys.all, "roadmap", roleId ?? {}],
};