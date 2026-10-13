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
import { formatDisplayDate, getRelativeLabel } from "@/features/admin/shared/companyDateFormat";
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
  const { mutate: setStatus, isPending: isSaving } = useUpdateAdminCompanyMutation(id);

  const handleStatusChange = (status) => setStatus({ status });
  const handleNavigate = (destination) => navigate(`${companiesPath}?${destination}`);

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
            title="Couldn't load this company"
            description={error?.message || "The company may have been deleted or merged."}
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
              value: formatDisplayDate(company.dates.created),
              sub: getRelativeLabel(company.dates.created),
              small: true,
            },
            {
              label: "lastUpdated",
              value: formatDisplayDate(company.dates.updated),
              sub: getRelativeLabel(company.dates.updated),
              small: true,
            },
          ]}
        />

        <div className="grid grid-cols-[1fr_340px] items-start gap-5 max-[900px]:grid-cols-1">
          <div className="space-y-5">
            <CompanyInformation profile={{ ...company.profile, companyName: company.name }} />
            <ContactInformation contact={company.contact} />
            <CompanyJobs jobs={company.jobs} onViewAll={() => handleNavigate("status=active")} />
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
                  date: formatDisplayDate(company.dates.created),
                  sub: getRelativeLabel(company.dates.created),
                },
                {
                  label: "lastUpdated",
                  date: formatDisplayDate(company.dates.updated),
                  sub: getRelativeLabel(company.dates.updated),
                },
                {
                  label: "submitted",
                  date: formatDisplayDate(company.submittedAt ?? company.dates.created),
                  sub: getRelativeLabel(company.submittedAt ?? company.dates.created),
                },
              ]}
            />
            <CompanyQuickLinks companyId={company.id} />
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

          {error && (
            <span className="flex items-center gap-2 text-[13px] font-semibold text-error">
              <AlertTriangle className="h-4 w-4" />
              {error.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}