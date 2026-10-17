import { Download, Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function CompaniesPageHeader({
  onAdd,
  onExport,
  onRefresh,
  isRefreshing = false,
}) {
  const { t } = useTranslation("dashboard");
  const key = "pages.admin.companyList";

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ink">
          {t("pages.admin.company.title")}
        </h1>
        <p className="mt-1 text-[14px] text-muted">
          {t("pages.admin.company.subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button
          type="button"
          onClick={onAdd}
          disabled={!onAdd}
          className="h-10 gap-2 rounded-xl bg-primary text-[13.5px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
        >
          <Plus className="h-4 w-4" />
          {t(`${key}.addCompany`)}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          disabled={!onExport}
          className="h-10 gap-2 rounded-xl border-border bg-surface text-[13.5px] font-semibold text-ink hover:bg-background"
        >
          <Download className="h-4 w-4" />
          {t(`${key}.export`)}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-10 gap-2 rounded-xl border-border bg-surface text-[13.5px] font-semibold text-ink hover:bg-background disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {t(`${key}.refresh`)}
        </Button>
      </div>
    </div>
  );
}