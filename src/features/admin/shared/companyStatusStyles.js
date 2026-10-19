import { CheckCircle2, Clock, Ban } from "lucide-react";

// `label` is now `labelKey` — a translation key rather than the English string,
// so the badge and the legend underneath it can never disagree about wording.
export const COMPANY_STATUS_STYLES = {
  verified: {
    labelKey: "ui.adminEnums.companyStatus.verified",
    icon: CheckCircle2,
    badgeClass: "bg-success/10 text-success border-success/25",
  },
  pending: {
    labelKey: "ui.adminEnums.companyStatus.pending",
    icon: Clock,
    badgeClass: "bg-warning/10 text-warning border-warning/30",
  },
  "not-verified": {
    labelKey: "ui.adminEnums.companyStatus.not-verified",
    icon: Ban,
    badgeClass: "bg-muted/10 text-muted border-muted/20",
  },
};