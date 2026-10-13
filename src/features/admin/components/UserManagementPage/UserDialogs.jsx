// src/features/admin/components/UserManagementPage/UserDialogs.jsx
//
// The add/edit user form and the change-role dialog. Both surface the
// mutation's own error message so a rejected save explains itself instead of
// failing silently.

import * as React from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeftRight, AlertTriangle, Loader2, PencilLine } from "lucide-react";
import Status from "@/components/shared/Status";
import Modal from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = ["candidate", "recruiter", "admin"];

export function UserFormBody({
  title,
  subtitle,
  submitLabel,
  initialValues,
  busy,
  error,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = React.useState(
    initialValues ?? { fullName: "", email: "", role: "candidate" },
  );
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Status
      icon={<PencilLine className="h-6 w-6" />}
      iconClassName="bg-primary/10 text-primary"
      title={title}
      subtitle={error ? null : subtitle}
      secondaryButton={{ label: "Cancel", onClick: onCancel, disabled: busy }}
      primaryButton={{
        label: busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : submitLabel,
        onClick: () => onSubmit(form),
        disabled: busy || !form.fullName.trim() || !form.email.trim(),
      }}
    >
      {error && <ErrorNote message={error} />}
      <div className="mb-5 flex flex-col gap-3 text-start">
        <FormField label="Full Name">
          <Input
            value={form.fullName}
            onChange={(event) => set("fullName")(event.target.value)}
            className="h-10 rounded-lg border-border"
          />
        </FormField>
        <FormField label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => set("email")(event.target.value)}
            className="h-10 rounded-lg border-border"
          />
        </FormField>
        <FormField label="Role">
          <Select value={form.role} onValueChange={set("role")}>
            <SelectTrigger className="h-10 rounded-lg border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role[0].toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </Status>
  );
}

export function ChangeRoleBody({ user, busy, error, onCancel, onConfirm }) {
  const { t } = useTranslation("dashboard");
  const [role, setRole] = React.useState(user.role);

  return (
    <Status
      icon={<ArrowLeftRight className="h-6 w-6" />}
      iconClassName="bg-primary/10 text-primary"
      title={t("pages.admin.userManagementStates.changeRole")}
      subtitle={error ? null : `Choose a new role for ${user.fullName}.`}
      secondaryButton={{ label: "Cancel", onClick: onCancel, disabled: busy }}
      primaryButton={{
        label: busy ? "Saving…" : "Confirm",
        onClick: () => onConfirm(role),
        disabled: busy || role === user.role,
      }}
    >
      {error && <ErrorNote message={error} />}
      <div className="mb-5 text-start">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-10 rounded-lg border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((option) => (
              <SelectItem key={option} value={option}>
                {option[0].toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Status>
  );
}

export function UserDialog({ children, onClose, maxWidth }) {
  return <Modal onClose={onClose} maxWidth={maxWidth}>{children}</Modal>;
}

function ErrorNote({ message }) {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-start text-[12.5px] font-semibold text-error">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}