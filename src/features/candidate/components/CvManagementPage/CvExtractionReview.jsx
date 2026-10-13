import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Languages,
  User,
  Layers,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Status from "@/components/shared/Status";

import CvProfileCard from "./CvProfileCard";
import CvExperiencesCard from "./CvExperiencesCard";
import CvEducationCard from "./CvEducationCard";
import CvSkillsCard from "./CvSkillsCard";
import CvLanguagesCard from "./CvLanguagesCard";

const ease = [0.16, 1, 0.3, 1];

export default function CvExtractionReview({
  extractionData,
  skills: legacySkills,
  onConfirmSkill,
  onConfirmExperience,
  onConfirmEducation,
  onConfirmLanguage,
  onConfirmProfile,
  onConfirmAll,
  onVerify,
  isVerifying = false,
  isVerified = false,
}) {
  const { t } = useTranslation("dashboard");
  const [activeTab, setActiveTab] = useState("all");

  const skills = extractionData?.skills || extractionData?.candidate_skills || legacySkills || [];
  const experiences = extractionData?.experiences || [];
  const educations = extractionData?.educations || [];
  const languages = extractionData?.languages || [];
  const user = extractionData?.user || null;
  const profile = extractionData?.candidate_profile || null;
  const profileConfirmed = extractionData?.profileConfirmed || false;

  const totalItems =
    (user || profile ? 1 : 0) +
    experiences.length +
    educations.length +
    skills.length +
    languages.length;

  const confirmedCount =
    (profileConfirmed ? 1 : 0) +
    experiences.filter((e) => e.confirmed).length +
    educations.filter((e) => e.confirmed).length +
    skills.filter((s) => s.confirmed).length +
    languages.filter((l) => l.confirmed).length;

  const allConfirmed = totalItems > 0 && confirmedCount === totalItems;

  const tabs = [
    {
      id: "all",
      label: t("pages.cvManagement.allExtractedData", "All Extracted Data"),
      icon: Layers,
      count: totalItems,
    },
    {
      id: "skills",
      label: t("pages.cvManagement.skills", "Skills"),
      icon: Sparkles,
      count: skills.length,
    },
    {
      id: "experience",
      label: t("pages.cvManagement.experience", "Experience"),
      icon: Briefcase,
      count: experiences.length,
    },
    {
      id: "education",
      label: t("pages.cvManagement.education", "Education"),
      icon: GraduationCap,
      count: educations.length,
    },
    {
      id: "profile",
      label: t("pages.cvManagement.profileAndBio", "Profile & Bio"),
      icon: User,
      count: user || profile ? 1 : 0,
    },
    {
      id: "languages",
      label: t("pages.cvManagement.languages", "Languages"),
      icon: Languages,
      count: languages.length,
    },
  ];

  if (totalItems === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16, ease }}
        className="rounded-2xl border border-border bg-surface p-6 shadow-xs"
      >
        <Status
          icon={<Sparkles className="h-6 w-6" />}
          iconClassName="bg-primary/10 text-primary"
          title={t("pages.cvManagement.emptyExtractionTitle", "No Extracted Data Available")}
          subtitle={t(
            "pages.cvManagement.emptyExtractionSubtitle",
            "Waiting for extraction schema details from backend."
          )}
        />
        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <Button
            type="button"
            disabled
            className="rounded-xl bg-success/50 px-6 py-2.5 text-xs font-bold text-success-foreground cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4 me-1.5" />
            {t("pages.cvManagement.confirmAndVerify", "Verify & Sync with Profile")}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.16, ease }}
      className="space-y-6"
    >
      {/* Header and Quick Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
            <Sparkles className="h-5 w-5 text-accent" />
            {t("pages.cvManagement.aiExtractionReview", "AI Extraction Review")}
          </h3>
          <p className="text-xs text-muted">
            {t(
              "pages.cvManagement.reviewSubtitle",
              "Verify and confirm your parsed professional background before updating your profile"
            )}
          </p>
        </div>

        {/* Verification Progress Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs">
          <span className="text-muted">{t("pages.cvManagement.verification", "Verification")}:</span>
          <span className="font-bold text-primary">
            {confirmedCount} {t("pages.cvManagement.of", "of")} {totalItems} {t("pages.cvManagement.confirmed", "confirmed")}
          </span>
          {allConfirmed && <CheckCircle2 className="h-4 w-4 text-success" />}
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-background/60 p-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-surface text-primary shadow-xs border border-border/80"
                  : "text-muted hover:text-ink hover:bg-surface/50"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`ms-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted/15 text-muted font-medium"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Extracted Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease }}
          className="space-y-6"
        >
          {/* Profile Section */}
          {(activeTab === "all" || activeTab === "profile") && (
            <CvProfileCard
              user={user}
              profile={profile}
              confirmed={profileConfirmed}
              onConfirm={onConfirmProfile}
            />
          )}

          {/* Skills Section */}
          {(activeTab === "all" || activeTab === "skills") && (
            <CvSkillsCard skills={skills} onConfirmSkill={onConfirmSkill} />
          )}

          {/* Work Experience Section */}
          {(activeTab === "all" || activeTab === "experience") && (
            <CvExperiencesCard
              experiences={experiences}
              onConfirmExperience={onConfirmExperience}
            />
          )}

          {/* Education Section */}
          {(activeTab === "all" || activeTab === "education") && (
            <CvEducationCard
              educations={educations}
              onConfirmEducation={onConfirmEducation}
            />
          )}

          {/* Languages Section */}
          {(activeTab === "all" || activeTab === "languages") && (
            <CvLanguagesCard
              languages={languages}
              onConfirmLanguage={onConfirmLanguage}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Footer */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="text-xs text-muted">
          <p className="font-semibold text-ink">
            {t("pages.cvManagement.readyToSync", "Ready to sync with your candidate profile?")}
          </p>
          <p>
            {t(
              "pages.cvManagement.syncDescription",
              "Confirming extracted data will update your MatchIn profile information automatically."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onVerify || onConfirmAll}
            disabled={isVerifying || isVerified || totalItems === 0}
            className="flex items-center gap-2 rounded-xl bg-success px-6 py-2.5 text-xs font-bold text-success-foreground hover:bg-success/90 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("pages.cvManagement.verifying", "Verifying & Syncing...")}
              </>
            ) : isVerified ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t("pages.cvManagement.verified", "Already Verified & Synced")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t("pages.cvManagement.confirmAndVerify", "Verify & Sync with Profile")}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
