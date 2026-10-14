import StatPill from "./StatPill";
import { Building2, CheckCircle2, Clock, Ban } from "lucide-react";

/**
 * CompanyStatsStrip
 * Counts come from the loaded rows (plus the server's total for the headline
 * tile), so the strip can never disagree with the table underneath it.
 */
const STAT_CONFIG = [
  { key: "total", label: "Total Companies", icon: Building2, iconClass: "bg-primary/10 text-primary" },
  { key: "verified", label: "Verified", icon: CheckCircle2, iconClass: "bg-success/10 text-success" },
  { key: "pending", label: "Pending Review", icon: Clock, iconClass: "bg-warning/10 text-warning" },
  { key: "not-verified", label: "Not Verified", icon: Ban, iconClass: "bg-muted/10 text-muted" },
];

export default function CompanyStatsStrip({ companies = [], total = companies.length }) {
  const counts = companies.reduce(
    (acc, company) => {
      acc[company.status] = (acc[company.status] ?? 0) + 1;
      return acc;
    },
    { verified: 0, pending: 0, "not-verified": 0 },
  );

  return (
    <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((stat, index) => (
        <StatPill
          key={stat.key}
          index={index}
          stat={{
            ...stat,
            value: stat.key === "total" ? total : (counts[stat.key] ?? 0),
          }}
        />
      ))}
    </div>
  );
}