// src/features/admin/components/companies/CompanyDialogs.jsx
//
// The add-company form. Mirrors UserFormBody: local state, and the mutation's
// own error surfaced inline so a rejected create explains itself instead of
// closing the dialog as if it had worked.
//
// The five fields are the endpoint's contract (see COMPANY_FIELD_ALIASES in
// admin-companies.api.js) and are deliberately not a superset of the company
// profile — anything not on that list is dropped by the backend without a word.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Building2, Loader2 } from "lucide-react";
import Status from "@/components/shared/Status";
import Modal from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_FORM = {
  name: "",
  industry: "",
  website: "",
  location: "",
  description: "",
};

const KEY = "pages.admin.companyList.form";

export function CompanyFormBody({
  title,
  subtitle,
  submitLabel,
  busy,
  error,
  onCancel,
  onSubmit,
}) {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const field = (name) => t(`${KEY}.fields.${name}`);
  const placeholder = (name) => t(`${KEY}.placeholders.${name}`);

  return (
    <Status
      icon={<Building2 className="h-6 w-6" />}
      iconClassName="bg-primary/10 text-primary"
      title={title}
      subtitle={error ? null : subtitle}
      secondaryButton={{
        label: tCommon("ui.adminShared.cancel"),
        onClick: onCancel,
        disabled: busy,
      }}
      primaryButton={{
        label: busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : submitLabel,
        onClick: () => onSubmit(form),
        disabled: busy || !form.name.trim(),
      }}
    >
      {error && <ErrorNote message={error} />}

      <div className="mb-5 grid grid-cols-1 gap-3 text-start sm:grid-cols-2">
        <FormField label={field("name")} className="sm:col-span-2">
          <Input
            value={form.name}
            onChange={(event) => set("name")(event.target.value)}
            placeholder={placeholder("name")}
            aria-label={field("name")}
            className="h-10 rounded-lg border-border"
          />
        </FormField>

        <FormField label={field("industry")}>
          <Input
            value={form.industry}
            onChange={(event) => set("industry")(event.target.value)}
            placeholder={placeholder("industry")}
            aria-label={field("industry")}
            className="h-10 rounded-lg border-border"
          />
        </FormField>

        <FormField label={field("website")}>
          <Input
            type="url"
            value={form.website}
            onChange={(event) => set("website")(event.target.value)}
            placeholder={placeholder("website")}
            aria-label={field("website")}
            className="h-10 rounded-lg border-border"
          />
        </FormField>

        <FormField label={field("location")} className="sm:col-span-2">
          <Input
            value={form.location}
            onChange={(event) => set("location")(event.target.value)}
            placeholder={placeholder("location")}
            aria-label={field("location")}
            className="h-10 rounded-lg border-border"
          />
        </FormField>

        <FormField label={field("description")} className="sm:col-span-2">
          <Textarea
            value={form.description}
            onChange={(event) => set("description")(event.target.value)}
            placeholder={placeholder("description")}
            aria-label={field("description")}
            className="min-h-20 rounded-lg border-border"
          />
        </FormField>
      </div>
    </Status>
  );
}

export function CompanyDialog({ children, onClose }) {
  // The five-field form is taller than the shared Modal's default, so cap the
  // height and let it scroll rather than overflowing short viewports.
  return (
    <Modal
      onClose={onClose}
      maxWidth="max-w-[560px]"
      className="max-h-[90vh] overflow-y-auto"
    >
      {children}
    </Modal>
  );
}

function ErrorNote({ message }) {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-start text-[12.5px] font-semibold text-error">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function FormField({ label, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}