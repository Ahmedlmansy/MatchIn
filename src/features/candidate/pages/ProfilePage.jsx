import i18n from "@/components/shared/i18n";
const t = (key) => i18n.t(key);
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import ProfileHeader from "../components/ProfilePage/ProfileHeader";

// Tabs Imports
import PersonalInfoTab from "../components/ProfilePage/PersonalInfoTab";
import SkillsTab from "../components/ProfilePage/SkillsTab";
import ExperienceTab from "../components/ProfilePage/ExperienceTab";
import EducationTab from "../components/ProfilePage/EducationTab";
import ProjectsTab from "../components/ProfilePage/ProjectsTab";
import CareerPreferencesTab from "../components/ProfilePage/PreferencesTab";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";

const TABS = [
  { id: "personal-info", labelKey: "pages.profile.personalInformation", Component: PersonalInfoTab },
  { id: "skills", labelKey: "pages.profile.skills", Component: SkillsTab },
  { id: "experience", labelKey: "pages.profile.workExperience", Component: ExperienceTab },
  { id: "education", labelKey: "pages.profile.education", Component: EducationTab },
  { id: "projects", labelKey: "pages.profile.projects", Component: ProjectsTab },
  {
    id: "career-preferences",
    labelKey: "pages.profile.careerPreferences",
    Component: CareerPreferencesTab,
  },
];

const triggerClass = [
  "px-5 py-3.5 text-sm font-medium whitespace-nowrap cursor-pointer",
  "rounded-none border-0 border-b-2 border-transparent -mb-[1px]",
  "bg-transparent shadow-none text-gray-500 transition-all duration-200",
  "hover:text-gray-800 hover:border-gray-300",
  "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
  "data-[state=active]:border-slate-800 data-[state=active]:text-slate-900 data-[state=active]:font-bold",
  "focus-visible:outline-none focus-visible:ring-0",
].join(" ");

export default function ProfilePage() {
  const { t } = useTranslation("dashboard");
  const [activeTab, setActiveTab] = useState("personal-info");

  // Fetch profile data from backend
  const { data: profile, isLoading, isError, error, refetch } = useProfileQuery();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100" />
              <div className="space-y-1">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-full md:w-72 bg-gray-100 border border-gray-200 rounded-xl p-4 space-y-3" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-12 bg-gray-100 border-b border-gray-200" />
            <div className="p-6 space-y-4">
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-20 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm text-center">
          <p className="text-red-600 mb-4">Failed to load profile: {error?.message ?? "Unknown error"}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Reusable Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full gap-0"
        >
          <TabsList className="h-auto w-full justify-start gap-0 p-0 px-6 pt-2 bg-transparent rounded-none border-b border-gray-200 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className={triggerClass}>
                {t(tab.labelKey || `pages.profile.${tab.id}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map(({ id, Component }) => (
            <TabsContent key={id} value={id} className="p-6 mt-0">
              <Component profile={profile} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}