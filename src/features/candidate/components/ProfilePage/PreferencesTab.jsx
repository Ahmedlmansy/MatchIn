import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import TabSaveActions from "./TabSaveActions";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";
import { useUpdateCareerPreferencesMutation } from "@/features/candidate/hooks/useUpdateCareerPreferencesMutation";

export default function CareerPreferencesTab({ profile }) {
  const { t } = useTranslation("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get profile data from the parent's query
  const { data: profileData, isLoading, refetch } = useProfileQuery();

  // Use passed profile or fallback to query data
  const currentProfile = profile || profileData;

  const [preferences, setPreferences] = useState({
    targetJobTitle: currentProfile?.jobTitle || "",
    preferredWorkEnv: currentProfile?.workStyle || "Remote",
  });

  const [formData, setFormData] = useState({ ...preferences });

  const updateCareerPreferencesMutation = useUpdateCareerPreferencesMutation({
    onSuccess: () => {
      setPreferences({ ...formData });
      setIsEditing(false);
      setIsSaving(false);
      refetch();
    },
    onError: (error) => {
      setIsSaving(false);
      console.error("Failed to update career preferences:", error);
    },
  });

  // Sync preferences with currentProfile when it changes
  useEffect(() => {
    if (currentProfile && !isEditing) {
      setPreferences({
        targetJobTitle: currentProfile?.jobTitle || "",
        preferredWorkEnv: currentProfile?.workStyle || "Remote",
      });
      setFormData({
        targetJobTitle: currentProfile?.jobTitle || "",
        preferredWorkEnv: currentProfile?.workStyle || "Remote",
      });
    }
  }, [currentProfile, isEditing]);

  const handleOpenEdit = () => {
    setFormData({ ...preferences });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveData = async () => {
    setIsSaving(true);
    
    try {
      await updateCareerPreferencesMutation.mutateAsync({
        job_title: formData.targetJobTitle,
        work_style: formData.preferredWorkEnv,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {t("pages.profile.careerPreferences")}
        </h3>

        <button
          onClick={handleOpenEdit}
          className="inline-flex items-center gap-2 bg-[#1E325C] hover:bg-[#162545] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{t("common.edit")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Job Title */}
        <div className="bg-[#FAF8F5]/80 border border-gray-100/60 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">
            {t("pages.profile.targetJobTitle")}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {preferences.targetJobTitle || "—"}
          </p>
        </div>

        <div className="bg-[#FAF8F5]/80 border border-gray-100/60 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">
            {t("pages.profile.preferredWorkEnv")}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {preferences.preferredWorkEnv || "—"}
          </p>
        </div>
      </div>

      <TabSaveActions
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={t("pages.profile.editCareerPreferences")}
        confirmLabel={t("common.save")}
        isLoading={isSaving}
        loadingLabel={t("common.saving")}
        onConfirm={handleSaveData}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              {t("pages.profile.targetJobTitle")} *
            </label>
            <input
              type="text"
              name="targetJobTitle"
              value={formData.targetJobTitle}
              onChange={handleChange}
              placeholder={t("pages.profile.targetJobTitlePlaceholder")}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E325C]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              {t("pages.profile.preferredWorkEnv")}
            </label>
            <div className="relative">
              <select
                name="preferredWorkEnv"
                value={formData.preferredWorkEnv}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E325C]/20 transition-all appearance-none cursor-pointer pe-10"
              >
                <option value="Remote">{t("pages.profile.workEnvRemote")}</option>
                <option value="Hybrid">{t("pages.profile.workEnvHybrid")}</option>
                <option value="On-site">{t("pages.profile.workEnvOnsite")}</option>
              </select>
              <div className="absolute inset-y-0 inset-e-0 flex items-center px-4 pointer-events-none text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </TabSaveActions>
    </div>
  );
}
