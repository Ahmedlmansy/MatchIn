import { useTranslation } from "react-i18next";
import { Ban, Eye, PencilLine, ArrowLeftRight, Power, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleBadge, UserStatusBadge } from "@/features/admin/shared";
import {
  formatDate,
  relativeActivityLabel,
} from "@/features/admin/shared/formatting/locale";

const AVATAR_COLORS = ["bg-primary", "bg-secondary", "bg-[#3d6b8a]", "bg-accent text-ink", "bg-[#5a6b4f]", "bg-[#6b4f6b]", "bg-[#4a6fa5]"];

const COLUMN_KEYS = ["user", "email", "role", "status", "created", "lastActivity"];

function initials(fullName) {
  return fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function TableHead() {
  const { t } = useTranslation("dashboard");
  const key = "pages.admin.userList.columns";

  return (
    <thead className="border-b border-border bg-[#f7f4ef]">
      <tr>
        {COLUMN_KEYS.map((column) => (
          <th
            key={column}
            className={cn(
              "whitespace-nowrap px-4 py-3 text-start text-[11.5px] font-bold uppercase tracking-wide text-muted",
              column === "actions" && "text-end",
            )}
          >
            {t(`${key}.${column}`)}
          </th>
        ))}
        <th className="whitespace-nowrap px-4 py-3 text-end text-[11.5px] font-bold uppercase tracking-wide text-muted">
          {t(`${key}.actions`)}
        </th>
      </tr>
    </thead>
  );
}

export function UserTable({ users, onView, onEdit, onChangeRole, onActivate, onDeactivate, onDelete }) {
  const { t } = useTranslation("dashboard");
  const actionKey = "pages.admin.userList.rowActions";

  return (
    <tbody>
      {users.map((user, index) => (
        <tr key={user.id} className={cn("border-b border-border transition-colors last:border-b-0 hover:bg-background/60", user.status !== "active" && "opacity-70")}>
          <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white", AVATAR_COLORS[index % AVATAR_COLORS.length])}>{initials(user.fullName)}</div><div><div className="text-sm font-semibold text-ink">{user.fullName}</div><div className="mt-0.5 font-mono text-xs text-muted">{user.id}</div></div></div></td>
          <td className="px-4 py-3.5 text-[13.5px] text-ink">{user.email}</td>
          <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
          <td className="px-4 py-3.5"><UserStatusBadge status={user.status} /></td>
          <td className="whitespace-nowrap px-4 py-3.5"><div className="text-[13.5px] text-ink">{formatDate(user.createdAt)}</div><div className="text-xs text-muted">{relativeActivityLabel(user.createdAt)}</div></td>
          <td className="whitespace-nowrap px-4 py-3.5"><div className="text-[13.5px] text-ink">{formatDate(user.lastActivityAt)}</div><div className="text-xs text-muted">{relativeActivityLabel(user.lastActivityAt)}</div></td>
          <td className="px-4 py-3.5"><div className="flex items-center justify-end gap-1"><RowIconButton title={t(`${actionKey}.view`)} onClick={() => onView(user)}><Eye className="h-4 w-4" /></RowIconButton><RowIconButton title={t(`${actionKey}.edit`)} onClick={() => onEdit(user)}><PencilLine className="h-4 w-4" /></RowIconButton><RowIconButton title={t(`${actionKey}.changeRole`)} onClick={() => onChangeRole(user)}><ArrowLeftRight className="h-4 w-4" /></RowIconButton>{user.status === "active" ? <RowIconButton title={t(`${actionKey}.deactivate`)} tone="danger" onClick={() => onDeactivate(user)}><Ban className="h-4 w-4" /></RowIconButton> : <RowIconButton title={t(`${actionKey}.activate`)} tone="success" onClick={() => onActivate(user)}><Power className="h-4 w-4" /></RowIconButton>}<RowIconButton title={t(`${actionKey}.delete`)} tone="danger" onClick={() => onDelete(user)}><Trash2 className="h-4 w-4" /></RowIconButton></div></td>
        </tr>
      ))}
    </tbody>
  );
}

function RowIconButton({ children, title, tone, onClick }) { return <button type="button" title={title} aria-label={title} onClick={onClick} className={cn("grid h-8 w-8 place-items-center rounded-lg border border-transparent text-muted transition-colors", tone === "danger" && "hover:border-error/20 hover:bg-error/10 hover:text-error", tone === "success" && "hover:border-success/20 hover:bg-success/10 hover:text-success", !tone && "hover:border-primary/15 hover:bg-primary/8 hover:text-primary")}>{children}</button>; }