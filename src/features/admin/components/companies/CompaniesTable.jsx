import { Building2 } from "lucide-react";
import CompanyRow from "./CompanyRow";

const COLUMNS = ["Company", "Verification", "Contact", "Created", "Last Updated"];

export default function CompaniesTable({
  companies = [],
  isLoading = false,
  onVerify,
  onReject,
  isUpdating = false,
}) {
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
          {COLUMNS.map((col) => (
            <th
              key={col}
              className="px-4 py-3 text-start text-[11.5px] font-bold uppercase tracking-wider text-muted"
            >
              {col}
            </th>
          ))}
          <th className="px-4 py-3 pe-5 text-end text-[11.5px] font-bold uppercase tracking-wider text-muted">
            Actions
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
            <td colSpan={COLUMNS.length + 1} className="px-4 py-12 text-center">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-muted" />
              <p className="text-[13.5px] text-muted">No companies match these filters.</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}