import StatPill from "./StatPill";
import { COMPANY_STATS } from "../constants/companyStats";

export default function CompanyStatsStrip() {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {COMPANY_STATS.map((stat, index) => (
        <StatPill key={stat.key} stat={stat} index={index} />
      ))}
    </div>
  );
}
