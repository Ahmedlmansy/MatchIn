import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompaniesResultsBar({
  total,
  start,
  end,
  sort,
  onSortChange,
  sortOptions,
}) {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="text-[13.5px] text-muted">
        {t("pages.admin.companyList.resultsCount", {
          count: total,
          start,
          end,
          total,
        })}
      </div>
      <div className="flex items-center gap-2 text-[13px] text-muted">
        <span>{t("pages.admin.companyList.sortBy")}</span>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-[34px] min-w-[160px] rounded-xl border-border bg-surface text-[13px] font-medium text-ink">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {tCommon(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}