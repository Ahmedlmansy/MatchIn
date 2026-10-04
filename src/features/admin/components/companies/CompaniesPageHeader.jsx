import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompaniesPageHeader({ onExport, onRefresh }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ink">Company Management</h1>
        <p className="mt-1 text-[14px] text-muted">
          View, verify, and manage companies registered on the platform
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          className="h-10 gap-2 rounded-xl border-border bg-surface text-[13.5px] font-semibold text-ink hover:bg-background"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          type="button"
          onClick={onRefresh}
          className="h-10 gap-2 rounded-xl bg-primary text-[13.5px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
