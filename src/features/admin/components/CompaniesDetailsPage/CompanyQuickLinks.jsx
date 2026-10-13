import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import Section from "./Section";

/**
 * CompanyQuickLinks
 * Cross-links to the surfaces this company also appears on. Each target is a
 * real route, filtered out when the company has no id to build it from.
 */
export default function CompanyQuickLinks({ companyId }) {
  const { t } = useTranslation("dashboard");
  const localizedPath = useLocalizedPath();

  const links = [
    companyId && {
      key: "jobs",
      icon: Building2,
      to: localizedPath(`/dashboard/job-management?search=${encodeURIComponent(companyId)}`),
    },
    companyId && {
      key: "auditLogs",
      icon: FileText,
      to: localizedPath(`/dashboard/audit-logs?entity=${encodeURIComponent(companyId)}`),
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