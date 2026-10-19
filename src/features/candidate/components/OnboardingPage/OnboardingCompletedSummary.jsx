import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, SlidersHorizontal } from "lucide-react";
import Status from "@/components/shared/Status";
import { useLocalizedPath } from "@/utils/routes";

const SUMMARY_FIELDS = [
  { key: "jobTitle", labelKey: "pages.onboarding.targetTitle" },
  { key: "jobType", labelKey: "pages.roadmap.jobType" },
  { key: "workStyle", labelKey: "pages.roadmap.workStyle" },
  { key: "location", labelKey: "pages.onboarding.location" },
];

export default function OnboardingCompletedSummary({ formData, onEdit }) {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();

  return (
    <Status
      icon={<Check className="h-6 w-6" />}
      iconClassName="bg-success text-success-foreground"
      title={t("pages.onboarding.complete")}
      subtitle={t("pages.onboarding.completedDescription")}
      secondaryButton={{ label: t("pages.onboarding.editChoices"), onClick: onEdit }}
      primaryButton={{ label: t("pages.onboarding.goToDashboard"), onClick: () => navigate(localizedPath("/dashboard")) }}
    >
      <div className="mb-5 rounded-2xl border border-border bg-background p-4 text-start">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-bold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          {t("pages.onboarding.preferences")}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {SUMMARY_FIELDS.map((field) => (
            <div key={field.key}>
              <div className="text-[11px] text-muted">{t(field.labelKey)}</div>
              <div className="text-[13px] font-semibold text-ink">
                {formData[field.key] || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Status>
  );
}
