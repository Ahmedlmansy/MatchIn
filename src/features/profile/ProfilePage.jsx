import React, { useState } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Tabs Imports
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import SkillsTab from "./tabs/SkillsTab";
import ExperienceTab from "./tabs/ExperienceTab";
import EducationTab from "./tabs/EducationTab";
import ProjectsTab from "./tabs/ProjectsTab";
import CareerPreferencesTab from "./tabs/PreferencesTab";

const TABS = [
  { id: "personal-info", label: "Personal Info", Component: PersonalInfoTab },
  { id: "skills", label: "Skills", Component: SkillsTab },
  { id: "experience", label: "Experience", Component: ExperienceTab },
  { id: "education", label: "Education", Component: EducationTab },
  { id: "projects", label: "Projects", Component: ProjectsTab },
  { id: "career-preferences", label: "Career Preferences", Component: CareerPreferencesTab },
];

// نفس ستايل التابات القديم بالظبط (border-b-2 + نشط غامق)
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
  const [activeTab, setActiveTab] = useState("personal-info");

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-slate-700">
            AM
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-gray-900">Ahmed Mahmoud</h1>
            <p className="text-sm text-gray-500 font-medium">
              Senior Frontend Engineer • Cairo, Egypt
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium pt-0.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified &amp; AI-Extracted CV</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-700">Profile Completion</span>
            <span className="text-slate-800">85%</span>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-slate-800 h-full w-[85%] rounded-full transition-all duration-500" />
          </div>

          <button className="flex items-center gap-2 text-xs font-semibold text-amber-900 hover:underline pt-1 cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            <span>Manage your CV file</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-0">
          <TabsList className="h-auto w-full justify-start gap-0 p-0 px-6 pt-2 bg-transparent rounded-none border-b border-gray-200 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className={triggerClass}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map(({ id, Component }) => (
            <TabsContent key={id} value={id} className="p-6 mt-0">
              <Component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}