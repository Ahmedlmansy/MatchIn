import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import { Link } from "react-router-dom";
import { Building2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import Section from "./Section";

/**
 * CompanyQuickLinks
 * Cross-links to the surfaces this company also appears on.
 *
 * Both links used to be built from the company **id**, which is the wrong value
 * for both filters and made the links useless:
 *
 *   · the job list's `search` matches a job title or company *name*, so a
 *     numeric id matched nothing and the link opened an empty list;
 *   · the audit list's `entity` filter matches the entity *type* ("Company",
 *     "Job"), not a row id, for the same reason.
 *
 * So the jobs link carries the company name and the audit link carries the
 * entity type. Each is dropped when the value it needs is missing.
 */
export default function CompanyQuickLinks({ companyName }) {
  const { t } = useTranslation("dashboard");
  const localizedPath = useLocalizedPath();

  const links = [
    companyName && {
      key: "jobs",
      icon: Building2,
      to: localizedPath(`/dashboard/job-management?search=${encodeURIComponent(companyName)}`),
    },
    {
      key: "auditLogs",
      icon: FileText,
      to: localizedPath(`/dashboard/audit-logs?entity=${encodeURIComponent("Company")}`),
    },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <Section title={t("pages.admin.companyDetails.quickLinks")}>
      <div className="flex flex-col gap-2">
        {links.map(({ key, icon: Icon, to }) => (
          <Button
            key={key}
            variant="outline"
            asChild
            className="h-10 w-full justify-center gap-2 rounded-xl border-border bg-surface text-ink"
          >
            <Link to={to}>
              <Icon className="h-4 w-4" />
              {t(`pages.admin.companyDetails.links.${key}`)}
            </Link>
          </Button>
        ))}
      </div>
    </Section>
  );
}