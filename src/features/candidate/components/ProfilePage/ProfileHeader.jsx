import React from "react";
import { CheckCircle2 } from "lucide-react";
import ProfileCompletionCard from "./ProfileCompletionCard";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";

export default function ProfileHeader({ profile }) {
  const { t } = useTranslation("dashboard");
  const localizedPath = useLocalizedPath();

  const name = profile?.jobTitle ? profile.jobTitle : "User";
  const title = profile?.location ? `${profile.location}` : "";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AM";
  const completionPercentage = profile?.profile_completed_at ? 85 : 60; // Mock calculation
  const cvPath = localizedPath("/dashboard/cv-management");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-slate-700">
          {initials}
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium pt-0.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t("profile.verifiedCv")}</span>
          </div>
        </div>
      </div>

      <ProfileCompletionCard
        completionPercentage={completionPercentage}
        cvPath={cvPath}
      />
    </div>
  );
}
