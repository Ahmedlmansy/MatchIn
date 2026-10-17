import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import CompanyRow from "./CompanyRow";

const COLUMN_KEYS = [
  "company",
  "verification",
  "contact",
  "created",
  "lastUpdated",
];

export default function CompaniesTable({
  companies = [],
  isLoading = false,
  onVerify,
  onReject,
  isUpdating = false,
}) {
  const { t } = useTranslation("dashboard");

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-14 animate-pulse rounded-xl bg-background" />
        ))}
      </div>
    );
  }

  return (
    <table className="w-full min-w-[920px] border-collapse">
      <thead className="border-b border-border bg-background">
        <tr>
          {COLUMN_KEYS.map((column) => (
            <th
              key={column}
              className="px-4 py-3 text-start text-[11.5px] font-bold uppercase tracking-wider text-muted"
            >
              {t(`pages.admin.companyList.columns.${column}`)}
            </th>
          ))}
          <th className="px-4 py-3 pe-5 text-end text-[11.5px] font-bold uppercase tracking-wider text-muted">
            {t("pages.admin.companyList.columns.actions")}
          </th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => (
          <CompanyRow
            key={company.id}
            company={company}
            onVerify={onVerify}
            onReject={onReject}
            isUpdating={isUpdating}
          />
        ))}
        {companies.length === 0 && (
          <tr>
            <td colSpan={COLUMN_KEYS.length + 1} className="px-4 py-12 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-muted" />
              <p className="text-[13.5px] text-muted">
                {t("pages.admin.companyList.noMatches")}
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}