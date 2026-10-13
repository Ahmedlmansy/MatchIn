// src/features/admin/pages/AuditLogsDetailsPage.jsx
//
// A single immutable audit-log record. The record comes from
// useAdminAuditLogQuery, which resolves it out of the cached list pages (the
// backend documents no /audit-logs/{id} route).

import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import { Briefcase, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader, Badge, ReadOnlyBanner, ErrorState } from "@/features/admin/shared";
import { useAdminAuditLogQuery } from "@/features/admin/hooks";
import {
  DetailCard,
  DiffViewer,
  RelatedEntityCard,
  AuditLogDetailsSkeleton,
} from "@/features/admin/components/auditLogDetails";

/** Small uppercase label used inside detail cards. */
function FieldLabel({ children }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
      {children}
    </label>
  );
}

export default function AuditLogDetails() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { auditId } = useParams();

  const auditLogsPath = localizedPath("/dashboard/audit-logs");
  const { data: log, isPending, isError, error } = useAdminAuditLogQuery(auditId);

  const returnToLogs = () => navigate(auditLogsPath);

  if (isPending) return <AuditLogDetailsSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-7">
        <div className="mx-auto max-w-4xl">
          <ErrorState
            title={error?.status === 404 ? "Audit log not found" : "Couldn't load this audit log"}
            description={error?.message}
            onRetry={returnToLogs}
          />
        </div>
      </div>
    );
  }

  // Related entities come from the record's own payload when the backend
  // supplies them; otherwise the log's entity is the only related record.
  const relatedEntities = log.related ?? [];

  return (
    <div className="max-w-225 mx-auto p-4 sm:p-7 pb-16 bg-background text-[#222831] min-h-screen font-sans antialiased">
      <PageHeader
        breadcrumbs={
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted mb-3 flex-wrap">
            <Link to={auditLogsPath} className="hover:text-primary transition-colors">
              {t("pages.admin.auditLogs")}
            </Link>
            <span className="opacity-60">/</span>
            <span className="font-medium text-[#222831]">{log.id}</span>
          </nav>
        }
        title={t("pages.admin.auditLogDetails")}
        subtitle={
          <span className="text-xs sm:text-sm font-mono text-muted">#{log.id}</span>
        }
        actions={
          <button
            type="button"
            onClick={returnToLogs}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold border border-transparent hover:bg-black/5 text-muted hover:text-[#222831] transition-colors"
          >
            Return to Audit Logs
          </button>
        }
      />

      <ReadOnlyBanner>
        This is an immutable record. Audit logs cannot be edited or deleted.
        They exist for full administrative traceability.
      </ReadOnlyBanner>

      {/* Status Strip */}
      <div className="flex flex-wrap items-center gap-3.5 p-3.5 px-4 bg-white border border-border rounded-2xl mb-5 shadow-sm">
        <Badge type={log.actionType} text={log.action} className="h-8 px-3.5 text-xs sm:text-sm font-bold" />
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted flex-wrap">
          <span>
            by <strong className="text-[#222831] font-semibold">{log.actor}</strong>
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{log.time}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{log.relative}</span>
        </div>
        <Badge type="readonly" text="Read-only" className="ml-auto" />
      </div>

      {/* Card 1: Actor */}
      <DetailCard title={t("pages.admin.auditDetails.actor")} hint="Who performed this action">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0",
              log.avatarClass,
            )}
          >
            {log.initials}
          </div>
          <div>
            <div className="font-bold text-base text-[#222831]">{log.actor}</div>
            <div className="text-xs sm:text-sm text-muted">{log.role}</div>
          </div>
        </div>
      </DetailCard>

      {/* Card 2: Entity */}
      <DetailCard
        title={t("pages.admin.auditDetails.entity")}
        hint="What was affected"
        delay={0.05}
        bodyClassName="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm"
      >
        <div>
          <FieldLabel>Entity Type</FieldLabel>
          <div className="font-semibold text-[#222831]">{log.entity}</div>
        </div>
        <div>
          <FieldLabel>Entity ID</FieldLabel>
          <div className="font-mono text-[#222831]">{log.entityId}</div>
        </div>
        {log.entityTitle && (
          <div className="sm:col-span-2">
            <FieldLabel>Entity Title</FieldLabel>
            <div className="font-bold text-primary">{log.entityTitle}</div>
          </div>
        )}
      </DetailCard>

      {/* Card 3: What Changed */}
      <DetailCard
        title={t("pages.admin.auditDetails.changes")}
        hint="Previous value → New value"
        delay={0.1}
      >
        <DiffViewer
          previous={log.previousData}
          next={log.nextData}
          changes={log.changes}
        />
      </DetailCard>

      {/* Card 4: Related Entities */}
      {relatedEntities.length > 0 && (
        <DetailCard
          title={t("pages.admin.auditDetails.relatedEntities")}
          hint="Jump to linked records"
          delay={0.15}
          bodyClassName="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
        >
          {relatedEntities.map((entity) => (
            <RelatedEntityCard key={entity.id} {...entity} />
          ))}
        </DetailCard>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
        <button
          type="button"
          onClick={returnToLogs}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold hover:bg-black/5 text-muted hover:text-[#222831] transition-colors"
        >
          Return to Audit Logs
        </button>
        <div className="flex gap-2.5 flex-wrap">
          <RelatedLink
            to={localizedPath(`/dashboard/company-management/${log.entityId}`)}
            icon={Building2}
            label="View Related Company"
          />
          <RelatedLink
            to={localizedPath(`/dashboard/job-management/${log.entityId}`)}
            icon={Briefcase}
            label="View Related Job"
            primary
          />
        </div>
      </div>
    </div>
  );
}

function RelatedLink({ to, icon: Icon, label, primary = false }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
        primary
          ? "border border-transparent bg-primary text-white hover:bg-[#182a4a]"
          : "border border-border bg-white hover:bg-[#f5f2ec]"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}