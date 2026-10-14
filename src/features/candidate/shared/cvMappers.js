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
  category: skill.category?.trim() ?? "General",
  proficiency_level: skill.proficiency_level?.trim?.() ?? skill.proficiency?.trim?.() ?? null,
  confidence_score:
    typeof skill.confidence_score === "number"
      ? skill.confidence_score
      : typeof skill.confidence === "number"
        ? (skill.confidence <= 1 ? Math.round(skill.confidence * 100) : Math.round(skill.confidence)) / 100
        : 0.8,
});

/**
 * Map extracted experience to verify experience payload
 * @param {Object} exp - Extracted experience from status response
 * @returns {Object} Verify experience payload
 */
export const mapExperienceToVerifyPayload = (exp) => {
  const rawEndDate = exp.is_current ? null : (exp.end_date ?? null);
  const normalizedEndDate = rawEndDate && String(rawEndDate).trim() !== "" ? String(rawEndDate).trim() : null;
  const rawStartDate = exp.start_date ?? null;
  const normalizedStartDate = rawStartDate && String(rawStartDate).trim() !== "" ? String(rawStartDate).trim() : null;

  return {
    company_name: exp.company_name?.trim() ?? "",
    title: exp.title?.trim() ?? exp.job_title?.trim() ?? "",
    start_date: normalizedStartDate,
    end_date: normalizedEndDate,
    description: exp.description?.trim() ?? "",
  };
};

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
 * @param {Object} extractionData - The completed extraction or items from status response
 * @param {Object} selection - User's selections { skillIds: [], experienceIds: [] } or array of items
 * @returns {Object} Verify payload { skills: [], experiences: [] }
 */
export const buildVerifyPayload = (extractionData, selection = {}) => {
  const rawSkills = extractionData?.skills ?? extractionData?.candidate_skills ?? [];
  const rawExperiences = extractionData?.experiences ?? [];

  const selectedSkills = selection?.skillIds
    ? rawSkills.filter((s) => selection.skillIds.includes(s.skill_id ?? s.id))
    : rawSkills;

  const selectedExperiences = selection?.experienceIds
    ? rawExperiences.filter((e) => selection.experienceIds.includes(e.id))
    : rawExperiences;

  return {
    skills: deduplicateSkills(selectedSkills.map(mapSkillToVerifyPayload)),
    experiences: filterValidExperiences(selectedExperiences.map(mapExperienceToVerifyPayload)),
  };
};

/**
 * Extract the latest COMPLETED extraction from CV status response
 * @param {Object} cvStatus - Normalized CV status from fetchCvStatusRequest
 * @returns {Object|null} The completed extraction object or null
 */
export const getLatestCompletedExtraction = (cvStatus) => {
  if (!cvStatus?.extractions?.length) return null;

  const completed = cvStatus.extractions
    .filter((e) => e.status === "completed")
    .sort((a, b) => (b.attempt_number ?? 0) - (a.attempt_number ?? 0));

  return completed[0] ?? null;
};

/**
 * Extract parsed skills/experiences from a completed extraction.
 * Isolated mapper waiting for real backend response schema.
 * Returns normalized arrays for UI rendering.
 * @param {Object} extraction - Completed extraction object
 * @returns {Object} { skills: [], candidate_skills: [], experiences: [], educations: [], languages: [], candidate_profile: {}, user: {} }
 */
export const extractParsedDataFromExtraction = (extraction) => {
  if (!extraction) {
    return {
      skills: [],
      candidate_skills: [],
      experiences: [],
      educations: [],
      languages: [],
      candidate_profile: {},
      user: {},
    };
  }

  const parsed = extraction.parsed_data ?? extraction.data ?? null;
  if (parsed && typeof parsed === "object") {
    const skills = parsed.skills ?? parsed.candidate_skills ?? [];
    return {
      skills,
      candidate_skills: skills,
      experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
      educations: Array.isArray(parsed.educations) ? parsed.educations : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      candidate_profile: parsed.candidate_profile ?? {},
      user: parsed.user ?? {},
    };
  }

  return {
    skills: [],
    candidate_skills: [],
    experiences: [],
    educations: [],
    languages: [],
    candidate_profile: {},
    user: {},
  };
};