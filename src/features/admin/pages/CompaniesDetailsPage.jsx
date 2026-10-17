// src/features/admin/pages/CompaniesDetailsPage.jsx
//
// Single company, admin view. Reads through useAdminCompanyQuery; the
// verification switch / reject button write through
// useUpdateAdminCompanyMutation and the page re-reads the record from the
// query cache after a successful save.

import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/features/admin/shared";
import {
  useAdminCompanyQuery,
  useUpdateAdminCompanyMutation,
} from "@/features/admin/hooks";
import { formatDate, relativeDayLabel } from "@/features/admin/shared/formatting/locale";
import {
  VERIFICATION_STATUS,
  DEFAULT_VERIFICATION_STATUS,
} from "@/features/admin/constants/companyVerification";
import {
  CompanyActivity,
  CompanyBreadcrumbs,
  CompanyDates,
  CompanyHeader,
  CompanyInformation,
  CompanyJobs,
  CompanyQuickLinks,
  ContactInformation,
  OverviewStats,
  VerificationBanner,
  VerificationCard,
} from "@/features/admin/components/CompaniesDetailsPage";

const BASE_KEY = "pages.admin.companyDetails";

export default function CompanyDetails() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { id } = useParams();

  const companiesPath = localizedPath("/dashboard/company-management");

  const { data: company, isPending, isError, error, refetch } = useAdminCompanyQuery(id);
  const {
    mutate: setStatus,
    isPending: isSaving,
    error: saveError,
  } = useUpdateAdminCompanyMutation(id);

  // The detail screen and the list speak different vocabularies for
  // verification — this one renders pending | verified | rejected, the list
  // collapses rejected into "not-verified". That mapping is for display only;
  // the wire value is always the list's vocabulary.
  //
  // Sending "rejected" straight through was a latent 422: the backend validates
  // `status in:verified,pending,not-verified`, so the Reject button failed
  // against the same endpoint the list used successfully — and, since the
  // mutation's error was never rendered, it failed silently.
  const handleStatusChange = (status) =>
    setStatus({ status: status === "rejected" ? "not-verified" : status });

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background px-4 py-7 sm:px-7">
        <div className="mx-auto max-w-275">
          <ErrorState
            title={t("pages.admin.companyDetails.loadFailed.title")}
            description={
              error?.message || t("pages.admin.companyDetails.loadFailed.description")
            }
            onRetry={() => (error?.status === 404 ? navigate(companiesPath) : refetch())}
          />
        </div>
      </div>
    );
  }

  // The details page models verification as pending | verified | rejected,
  // while the list collapses it to verified | pending | not-verified. Map the
  // two vocabularies so the switch reflects what the list would show.
  const verificationStatus =
    company.status === "not-verified" ? "rejected" : company.status || DEFAULT_VERIFICATION_STATUS;
  const statusConfig =
    VERIFICATION_STATUS[verificationStatus] ?? VERIFICATION_STATUS[DEFAULT_VERIFICATION_STATUS];

  return (
    <div className="min-h-screen bg-background px-4 py-7 pb-16 sm:px-7">
      <div className="mx-auto max-w-275 space-y-0">
        <CompanyBreadcrumbs companyId={company.id} backTo={companiesPath} />

        <CompanyHeader company={company} backTo={companiesPath} />

        <div className="mb-5.5">
          <VerificationBanner
            status={verificationStatus}
            title={t(`${BASE_KEY}.${statusConfig.bannerKey}`)}
            description={t(`${BASE_KEY}.bannerDescriptions.${verificationStatus}`)}
          />
        </div>

        <OverviewStats
          stats={[
            {
              label: "openJobs",
              value: company.stats.openJobs,
              sub: `${company.stats.drafts} drafts`,
            },
            {
              label: "totalApplications",
              value: company.stats.totalApplications,
              sub: `${company.stats.applicationsThisWeek} this week`,
            },
            {
              label: "created",
              value: formatDate(company.dates.created),
              sub: relativeDayLabel(company.dates.created),
              small: true,
            },
            {
              label: "lastUpdated",
              value: formatDate(company.dates.updated),
              sub: relativeDayLabel(company.dates.updated),
              small: true,
            },
          ]}
        />

        <div className="grid grid-cols-[1fr_340px] items-start gap-5 max-[900px]:grid-cols-1">
          <div className="space-y-5">
            <CompanyInformation profile={{ ...company.profile, companyName: company.name }} />
            <ContactInformation contact={company.contact} />
            {/* "View all jobs" is on the jobs panel, so it belongs on the job
                list — it was navigating to the *companies* list with
                ?status=active, which is a company-status filter and showed the
                admin a list of companies instead of this company's jobs. */}
            <CompanyJobs
              jobs={company.jobs}
              onViewAll={() =>
                navigate(
                  `${localizedPath("/dashboard/job-management")}?search=${encodeURIComponent(company.name)}`,
                )
              }
            />
            <CompanyActivity activity={company.activity} />
          </div>

          <aside className="sticky top-6 space-y-5">
            <VerificationCard
              status={verificationStatus}
              onStatusChange={handleStatusChange}
              isSaving={isSaving}
            />
            <CompanyDates
              dates={[
                {
                  label: "created",
                  date: formatDate(company.dates.created),
                  sub: relativeDayLabel(company.dates.created),
                },
                {
                  label: "lastUpdated",
                  date: formatDate(company.dates.updated),
                  sub: relativeDayLabel(company.dates.updated),
                },
                {
                  label: "submitted",
                  date: formatDate(company.submittedAt ?? company.dates.created),
                  sub: relativeDayLabel(company.submittedAt ?? company.dates.created),
                },
              ]}
            />
            <CompanyQuickLinks companyName={company.name} />
          </aside>
        </div>

        {/* Footer */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="ghost" asChild className="h-10 gap-2 rounded-xl text-muted hover:text-ink">
            <Link to={companiesPath}>
              <ArrowLeft className="h-4 w-4" />
              {t(`${BASE_KEY}.backToCompanies`)}
            </Link>
          </Button>

          {/*
            This slot used to render `error`, which is the *query* error — and
            the query error is always null here, because the isError branch
            above already returned an ErrorState. So a failed Verify or Reject
            produced no message anywhere on the page and the switch just
            snapped back.
          */}
          {saveError ? (
            <span className="flex items-center gap-2 text-[13px] font-semibold text-error">
              <AlertTriangle className="h-4 w-4" />
              {saveError.message}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}