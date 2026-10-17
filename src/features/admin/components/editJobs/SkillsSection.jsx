import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * SkillsSection
 * Required / preferred skill chips.
 *
 * Both lists are read straight from `formData` (controlled) instead of being
 * mirrored into local state. The previous local-state copy was seeded once on
 * mount, so it silently kept showing the mock skills after the real job
 * loaded — a classic stale-state bug now that this page loads from the API.
 * Only the "type a new skill" text inputs keep local state.
 */
export default function SkillsSection({ formData, onChange }) {
  const { t } = useTranslation("common");
  const [reqInput, setReqInput] = useState("");
  const [prefInput, setPrefInput] = useState("");

  const requiredSkills = formData?.requiredSkills ?? [];
  const preferredSkills = formData?.preferredSkills ?? [];

  const add = (key, value, resetInput) => (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const skill = value.trim();
    if (!skill) return;
    const current = key === "requiredSkills" ? requiredSkills : preferredSkills;
    if (!current.includes(skill)) onChange?.(key, [...current, skill]);
    resetInput("");
  };

  const remove = (key, skill) => {
    const current = key === "requiredSkills" ? requiredSkills : preferredSkills;
    onChange?.(key, current.filter((item) => item !== skill));
  };

  return (
    <Card className="bg-white border border-[#ECEAE5] shadow-none rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F0EC]">
        <h2 className="text-sm font-bold text-[#09090B]">{t("ui.skills.title")}</h2>
        <span className="text-xs text-[#8E8E93]">{t("ui.skills.description")}</span>
      </div>

      <CardContent className="p-6 space-y-5">
        <SkillField
          label={t("ui.skills.required")}
          required
          placeholder={t("ui.skills.placeholder")}
          skills={requiredSkills}
          value={reqInput}
          onValueChange={setReqInput}
          onKeyDown={add("requiredSkills", reqInput, setReqInput)}
          onRemove={remove("requiredSkills")}
        />

        <SkillField
          label={t("ui.skills.preferred")}
          placeholder={t("ui.skills.placeholder")}
          skills={preferredSkills}
          value={prefInput}
          onValueChange={setPrefInput}
          onKeyDown={add("preferredSkills", prefInput, setPrefInput)}
          onRemove={remove("preferredSkills")}
        />
      </CardContent>
    </Card>
  );
}

function SkillField({
  label,
  required = false,
  placeholder,
  skills,
  value,
  onValueChange,
  onKeyDown,
  onRemove,
}) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-[#09090B]">
        {label}{" "}
        {required ? (
          <span className="text-[#DC2626]">*</span>
        ) : (
          <span className="text-[#A1A1AA] font-normal">{t("ui.skills.optional")}</span>
        )}
      </Label>
      <div className="flex flex-wrap items-center gap-2 min-h-[48px] p-2 bg-white border border-[#E4E4E7] rounded-xl focus-within:ring-1 focus-within:ring-[#1D2A44]">
        {skills.map((skill) => (
          <Badge
            key={skill}
            className="bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#09090B] border-none px-3 py-1 text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-none"
          >
            {skill}
            <button
              type="button"
              onClick={onRemove(skill)}
              aria-label={t("ui.editJob.removeSkill", { skill })}
              className="hover:text-[#DC2626] transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5 text-[#09090B]" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-[#09090B] placeholder:text-[#A1A1AA] min-w-[180px]"
        />
      </div>
    </div>
  );
}