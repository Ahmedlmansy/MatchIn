import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import { CheckCircle2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CompanyRowActions
 * Verify / Reject call the PATCH mutation; Manage and the eye icon navigate to
 * the real, localized company detail route.
 */
export default function CompanyRowActions({ company, onVerify, onReject, isUpdating }) {
  const { t } = useTranslation("dashboard");
  const localizedPath = useLocalizedPath();
  const key = "pages.admin.companyList.actions";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {company.status === "verified" ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-border bg-surface text-[12.5px] font-semibold text-ink hover:bg-background"
        >
          <Link to={localizedPath(`/dashboard/company-management/${company.id}`)}>
            {t(`${key}.manage`)}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={isUpdating}
          onClick={() => onVerify(company.id)}
          className="h-8 gap-1.5 rounded-lg bg-success text-[12.5px] font-semibold text-success-foreground hover:bg-success/90 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="h-[14px] w-[14px] animate-spin" />
          ) : (
            <CheckCircle2 className="h-[14px] w-[14px]" />
          )}
          {t(`${key}.verify`)}
        </Button>
      )}

      {company.status === "pending" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUpdating}
          onClick={() => onReject(company.id)}
          className="h-8 rounded-lg border-error/35 bg-transparent text-[12.5px] font-semibold text-error hover:border-error hover:bg-error/10 disabled:opacity-50"
        >
          {t(`${key}.reject`)}
        </Button>
      )}

      <Button
        asChild
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-muted hover:bg-primary/10 hover:text-primary"
      >
        <Link
          to={localizedPath(`/dashboard/company-management/${company.id}`)}
          title={t(`${key}.view`)}
          aria-label={t(`${key}.viewAria`, { name: company.name })}
        >
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}