import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const ROLE_STYLES = {
  candidate: "bg-success/10 text-success border-success/20",
  recruiter: "bg-primary/10 text-primary border-primary/15",
  admin: "bg-secondary/10 text-secondary border-secondary/20",
};

const ROLE_LABEL_KEYS = {
  candidate: "ui.adminEnums.roles.candidate",
  recruiter: "ui.adminEnums.roles.recruiter",
  admin: "ui.adminEnums.roles.admin",
};

const STATUS_STYLES = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted/15 text-muted",
  suspended: "bg-error/10 text-error",
};

const STATUS_DOT = { active: "bg-success", inactive: "bg-muted", suspended: "bg-error" };

const USER_STATUS_LABEL_KEYS = {
  active: "ui.adminEnums.userStatus.active",
  inactive: "ui.adminEnums.userStatus.inactive",
  suspended: "ui.adminEnums.userStatus.suspended",
};

/**
 * Enum value -> translated label.
 *
 * Values come from the backend and are normalized to a closed set by the api
 * layer, so an unknown value renders as-is rather than as an empty pill. This is
 * the one place that knows the enum -> key mapping, so toolbars, badges and CSV
 * exports can never drift apart.
 */
export function enumLabel(t, keys, value) {
  const key = keys[value];
  return key ? t(key) : (value ?? "");
}

export function RoleBadge({ role }) {
  const { t } = useTranslation("common");
  return (
    <span className={cn("inline-flex h-[26px] items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-bold", ROLE_STYLES[role])}>
      {enumLabel(t, ROLE_LABEL_KEYS, role)}
    </span>
  );
}

export function UserStatusBadge({ status }) {
  const { t } = useTranslation("common");

  return (
    <span className={cn("inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-bold", STATUS_STYLES[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {enumLabel(t, USER_STATUS_LABEL_KEYS, status)}
    </span>
  );
}

export { ROLE_LABEL_KEYS, USER_STATUS_LABEL_KEYS };