import React, { useState } from "react";
import { CheckCircle2, FileText, Edit } from "lucide-react";

// Tabs Imports
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import SkillsTab from "./tabs/SkillsTab";
import ExperienceTab from "./tabs/ExperienceTab";
import EducationTab from "./tabs/EducationTab";
import ProjectsTab from "./tabs/ProjectsTab";
import CareerPreferencesTab from "./tabs/PreferencesTab";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal-info");

  const tabs = [
    { id: "personal-info", label: "Personal Info" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "career-preferences", label: "Career Preferences" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal-info":
        return <PersonalInfoTab />;
      case "skills":
        return <SkillsTab />;
      case "experience":
        return <ExperienceTab />;
      case "education":
        return <EducationTab />;
      case "projects":
        return <ProjectsTab />;
      case "career-preferences":
        return <CareerPreferencesTab />;
      default:
        return <PersonalInfoTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {}
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
              <span>Verified & AI-Extracted CV</span>
            </div>
          </div>
        </div>

        {}
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

      
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        <div className="flex border-b border-gray-200 px-6 pt-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border-b-2 -mb-[1px] ${
                  isActive
                    ? "border-slate-800 text-slate-900 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}