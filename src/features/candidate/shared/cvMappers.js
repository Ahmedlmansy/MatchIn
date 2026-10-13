// src/features/candidate/shared/cvMappers.js
/**
 * Mappers for CV verification payload.
 * Transforms UI-friendly extraction data to the exact backend contract.
 * Backend verify expects:
 * - skills: [{ name, category, proficiency_level, confidence_score }]
 * - experiences: [{ company_name, title, start_date, end_date, description }]
 * Note: `title` NOT `job_title` for experiences (profile API uses job_title).
 */

/**
 * Map extracted skill to verify skill payload
 * @param {Object} skill - Extracted skill from status response
 * @returns {Object} Verify skill payload
 */
export const mapSkillToVerifyPayload = (skill) => ({
  name: skill.name?.trim() ?? "",
  category: skill.category?.trim() ?? "General", // Default category if not provided
  proficiency_level: skill.proficiency?.trim() ?? null, // Can be "Beginner", "Intermediate", "Advanced", "Expert" or null
  confidence_score: typeof skill.confidence === "number"
    ? (skill.confidence <= 1 ? Math.round(skill.confidence * 100) : Math.round(skill.confidence)) / 100
    : 0.8, // Default confidence
});

/**
 * Map extracted experience to verify experience payload
 * @param {Object} exp - Extracted experience from status response
 * @returns {Object} Verify experience payload
 */
export const mapExperienceToVerifyPayload = (exp) => ({
  company_name: exp.company_name?.trim() ?? "",
  title: exp.job_title?.trim() ?? "", // BACKEND EXPECTS `title` not `job_title`
  start_date: exp.start_date ?? null, // YYYY-MM-DD or null
  end_date: exp.is_current ? null : (exp.end_date ?? null), // null if current
  description: exp.description?.trim() ?? "",
});

/**
 * Deduplicate skills by lowercase name within the submitted list
 * (Do NOT deduplicate against existing profile - backend handles that)
 * @param {Array} skills - Array of skill payloads
 * @returns {Array} Deduplicated skills
 */
export const deduplicateSkills = (skills) => {
  const seen = new Set();
  return skills.filter((skill) => {
    const key = skill.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Filter out empty rows from experiences
 * @param {Array} experiences - Array of experience payloads
 * @returns {Array} Filtered experiences
 */
export const filterValidExperiences = (experiences) =>
  experiences.filter(
    (exp) => exp.company_name || exp.title || exp.description
  );

/**
 * Build the complete verify payload from extraction data
 * @param {Object} extractionData - The completed extraction from status response
 * @param {Object} selection - User's selections { skillIds: [], experienceIds: [] }
 * @returns {Object} Verify payload { skills: [], experiences: [] }
 */
export const buildVerifyPayload = (extractionData, selection) => {
  const skills = extractionData?.candidate_skills ?? [];
  const experiences = extractionData?.experiences ?? [];

  const selectedSkills = skills
    .filter((s) => selection.skillIds.includes(s.skill_id ?? s.id))
    .map(mapSkillToVerifyPayload);

  const selectedExperiences = experiences
    .filter((e) => selection.experienceIds.includes(e.id))
    .map(mapExperienceToVerifyPayload);

  return {
    skills: deduplicateSkills(selectedSkills),
    experiences: filterValidExperiences(selectedExperiences),
  };
};

/**
 * Extract the latest COMPLETED extraction from CV status response
 * @param {Object} cvStatus - Normalized CV status from fetchCvStatusRequest
 * @returns {Object|null} The completed extraction object or null
 */
export const getLatestCompletedExtraction = (cvStatus) => {
  if (!cvStatus?.extractions?.length) return null;

  // Find the extraction with highest attempt_number that has status "completed"
  const completed = cvStatus.extractions
    .filter((e) => e.status === "completed")
    .sort((a, b) => (b.attempt_number ?? 0) - (a.attempt_number ?? 0));

  return completed[0] ?? null;
};

/**
 * Extract parsed skills/experiences from a completed extraction
 * BACKEND SHAPE UNKNOWN - This is a stub that will be updated once real response is known.
 * Expected to find parsed data in extraction.parsed_data or similar.
 * @param {Object} extraction - Completed extraction object
 * @returns {Object} { candidate_skills: [], experiences: [], educations: [], languages: [], candidate_profile: {}, user: {} }
 */
export const extractParsedDataFromExtraction = (extraction) => {
  // STUB: Backend shape unknown - waiting for real response
  // Expected: extraction.parsed_data or extraction.data or similar
  // For now return empty structure - will be populated after seeing real response
  console.warn(
    "[cvMappers] extractParsedDataFromExtraction: Backend extraction shape unknown. Using mock structure.",
    extraction
  );

  return {
    candidate_skills: [],
    experiences: [],
    educations: [],
    languages: [],
    candidate_profile: {},
    user: {},
  };
};