import { BriefcaseBusiness } from "lucide-react";
import { EmptyState } from "@/features/admin/shared";

/**
 * JobManagementEmpty
 * Empty-state view shown when no jobs exist on the platform at all.
 */
export default function JobManagementEmpty() {
  return (
    <EmptyState
      icon={<BriefcaseBusiness className="w-7 h-7" />}
      title="No jobs on the platform yet"
      description="Jobs will appear here once companies post internally or external sources start syncing listings."
    />
  );
}