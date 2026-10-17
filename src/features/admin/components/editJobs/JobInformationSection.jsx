import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

// Job sources are the same closed set the list screen filters on, so the
// value stored is the API's own enum rather than a display label.
const SOURCE_OPTIONS = [
  { value: "internal", labelKey: "ui.jobSources.internal" },
  { value: "linkedin", labelKey: "ui.jobSources.linkedin" },
  { value: "indeed", labelKey: "ui.jobSources.indeed" },
  { value: "referral", labelKey: "ui.jobSources.referral" },
];

export default function JobInformationSection({ formData, onChange, companies = [] }) {
  const { t } = useTranslation("common");
  return (
    <Card className="bg-white border border-[#ECEAE5] shadow-none rounded-2xl overflow-hidden">
      {/* Header section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F0EC]">
        <h2 className="text-sm font-bold text-[#09090B]">{t("ui.jobInfo.title")}</h2>
        <span className="text-xs text-[#8E8E93]">{t("ui.jobInfo.description")}</span>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Job Title Field */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-[#09090B]">
            {t("ui.jobInfo.jobTitle")} <span className="text-[#DC2626]">*</span>
          </Label>
          <Input
            value={formData?.jobTitle || ""}
            onChange={(e) => onChange("jobTitle", e.target.value)}
            className="h-12 w-full bg-white border-[#E4E4E7] rounded-xl text-sm px-4 focus-visible:ring-[#1D2A44] transition-all"
            placeholder={t("ui.editJob.jobTitlePlaceholder")}
          />
        </div>

        {/* Company & Source Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Dropdown (Full Width) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#09090B]">
              {t("ui.jobInfo.company")} <span className="text-[#DC2626]">*</span>
            </Label>
            <Select
              value={formData?.company || ""}
              onValueChange={(val) => onChange("company", val)}
              disabled={!companies.length}
            >
              <SelectTrigger className="h-12 w-full bg-white border-[#E4E4E7] rounded-xl text-sm px-4 focus:ring-[#1D2A44]">
                <SelectValue placeholder={t("ui.jobInfo.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-[#A1A1AA]">{t("ui.jobInfo.linkedCompany")}</p>
          </div>

          {/* Source Dropdown (Full Width) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#09090B]">
              {t("ui.jobInfo.source")} <span className="text-[#A1A1AA] font-normal">{t("ui.jobInfo.optional")}</span>
            </Label>
            <Select
              value={formData?.source || "internal"}
              onValueChange={(val) => onChange("source", val)}
            >
              <SelectTrigger className="h-12 w-full bg-white border-[#E4E4E7] rounded-xl text-sm px-4 focus:ring-[#1D2A44]">
                <SelectValue placeholder={t("ui.jobInfo.selectSource")} />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}