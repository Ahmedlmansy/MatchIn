import { useTranslation } from "react-i18next";
import CompanyStatusBadge from "./CompanyStatusBadge";

const LEGEND_KEYS = ["verified", "pending", "notVerified"];

export default function CompanyStatusLegend() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-muted">
      {LEGEND_KEYS.map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <CompanyStatusBadge status={key} compact />
          {t(`pages.admin.companyList.legend.${key}`)}
        </span>
      ))}
    </div>
  );
}