import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import TabSaveActions from "./TabSaveActions";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";
import { useUpdateProfileMutation } from "@/features/candidate/hooks/useUpdateProfileMutation";

export default function PersonalInfoTab({ profile }) {
  const { t } = useTranslation("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get profile data from the parent's query
  const { data: profileData, isLoading, refetch } = useProfileQuery();

  // Use passed profile or fallback to query data
  const currentProfile = profile || profileData;

  const [userInfo, setUserInfo] = useState({
    titleRole: currentProfile?.jobTitle || "",
    company: currentProfile?.company || "",
  });

  const [formData, setFormData] = useState({ ...userInfo });

  const updateProfileMutation = useUpdateProfileMutation({
    onSuccess: () => {
      setUserInfo({ ...formData });
      setIsEditing(false);
      setIsSaving(false);
      refetch();
    },
    onError: (error) => {
      setIsSaving(false);
      // Error is handled by the mutation hook
      console.error("Failed to update profile:", error);
    },
  });

  // Sync userInfo with currentProfile when it changes
  useEffect(() => {
    if (currentProfile && !isEditing) {
      setUserInfo({
        titleRole: currentProfile?.jobTitle || "",
        company: currentProfile?.company || "",
      });
      setFormData({
        titleRole: currentProfile?.jobTitle || "",
        company: currentProfile?.company || "",
      });
    }
  }, [currentProfile, isEditing]);

  const handleOpenEdit = () => {
    setFormData({ ...userInfo });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveData = async () => {
    setIsSaving(true);
    
    try {
      await updateProfileMutation.mutateAsync({
        job_title: formData.titleRole,
        company: formData.company,
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

  } else {
    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {t("pages.profile.personalInformation")}
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
        <div className="bg-[#FAF8F5]/80 border border-gray-100/60 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">
            {t("pages.profile.jobTitle")}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {userInfo.titleRole || "—"}
          </p>
        </div>

        <div className="bg-[#FAF8F5]/80 border border-gray-100/60 p-4 rounded-2xl space-y-1">
          <span className="text-xs font-medium text-slate-400 block">
            {t("pages.profile.company")}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {userInfo.company || "—"}
          </p>
        </div>
      </div>

      <TabSaveActions
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={t("pages.profile.editPersonalInformation")}
        confirmLabel={t("common.save")}
        isLoading={isSaving}
        loadingLabel={t("common.saving")}
        onConfirm={handleSaveData}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              {t("pages.profile.jobTitle")} *
            </label>
            <input
              type="text"
              name="titleRole"
              value={formData.titleRole}
              onChange={handleChange}
              placeholder={t("pages.profile.jobTitlePlaceholder")}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E325C]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              {t("pages.profile.company")}
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder={t("pages.profile.companyPlaceholder")}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-gray-200/80 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E325C]/20 transition-all"
            />
          </div>
        </div>
      </TabSaveActions>
    </div>
  );
}
}