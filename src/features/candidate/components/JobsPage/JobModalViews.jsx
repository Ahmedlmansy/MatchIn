import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck, StickyNotes } from "lucide-react";
import Modal from "@/components/shared/Modal";
import Status from "@/components/shared/Status";
import JobApplicationModal from "./JobApplicationModal";

function Spinner() {
  return (
    <div className="h-10 w-10">
      <motion.div
        className="h-10 w-10 rounded-full border-[3px] border-border border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </div>
  );
}

export default function JobModalViews({
  view,
  activeJob,
  form,
  onClose,
  onRetry,
  onSubmit,
}) {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");
  if (view === "form") {
    return (
      <JobApplicationModal
        job={activeJob}
        form={form}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );
  }

  if (view === "loading") {
    return (
      <Modal onClose={() => {}}>
        <Status
          icon={<Spinner />}
          title={t("pages.applicationSubmission.checkingStatus")}
          subtitle={t("pages.applicationSubmission.verifyingDescription")}
          secondaryButton={{ label: tCommon("actions.cancel"), disabled: true }}
          primaryButton={{ label: t(`pages.applicationSubmission.holdOn`), disabled: true }}
        />
      </Modal>
    );
  }

  if (view === "submitting") {
    return (
      <Modal onClose={() => {}}>
        <Status
          icon={<Spinner />}
          title={t("pages.applicationSubmission.submitting")}
          subtitle={t("pages.applicationSubmission.keepOpenDescription")}
          secondaryButton={{ label: "Cancel", disabled: true }}
          primaryButton={{ label: t("pages.applicationSubmission.submitting"), disabled: true }}
        />
      </Modal>
    );
  }

  if (view === "success") {
    return (
      <Modal onClose={onClose}>
        <Status
          icon={<CircleCheck className="h-7 w-7 text-success" />}
          iconClassName="border border-success/30 bg-success/10"
          title={t("pages.applicationSubmission.submitted")}
          subtitle={
            <>
              {t("pages.applicationSubmission.successBody", {
                job: activeJob.title,
                company: activeJob.company,
              })} You will receive
              updates as status changes.
            </>
          }
          secondaryButton={{ label: tCommon("actions.close"), onClick: onClose }}
          primaryButton={{ label: t(`pages.applicationSubmission.viewMyApplications`) }}
        >
          <ApplicationSummary />
        </Status>
      </Modal>
    );
  }

  if (view === "duplicate") {
    return (
      <Modal onClose={onClose}>
        <Status
          icon={<StickyNotes className="text-[28px] text-warning" />}
          iconClassName="border border-warning/30 bg-warning/10"
          title={t("pages.applicationSubmission.alreadyApplied")}
          subtitle={
            <>
              {t("pages.applicationSubmission.alreadyAppliedBody", {
                job: activeJob.title,
                company: activeJob.company,
                date: "August 24, 2026",
              })} Multiple applications are
              not permitted.
            </>
          }
          secondaryButton={{ label: tCommon("actions.close"), onClick: onClose }}
          primaryButton={{ label: t(`pages.applicationSubmission.viewApplication`) }}
        >
          <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-background/50 p-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EFF3EF] px-2.5 py-1 text-[11px] font-bold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {tCommon("ui.jobStatus.underReview")}
            </span>
            <span className="text-muted">
              {t("pages.applicationSubmission.lastUpdated", { date: "Aug 27, 2026" })}
            </span>
          </div>
        </Status>
      </Modal>
    );
  }

  if (view === "servererror") {
    return (
      <Modal onClose={onClose}>
        <Status
          icon={<CircleAlert className="h-7 w-7 text-error" />}
          iconClassName="border border-error/30 bg-error/10"
          title={t("pages.applicationSubmission.failed")}
          subtitle={t("pages.applicationSubmission.serverErrorDescription")}
          secondaryButton={{ label: "Cancel", onClick: onClose }}
          primaryButton={{ label: t(`%s.retrySubmission`), onClick: onRetry }}
        />
      </Modal>
    );
  }

  return null;
}

function ApplicationSummary() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="mb-6 space-y-1.5 rounded-xl border border-border bg-background/50 p-3 text-start text-xs text-primary">
      <div className="flex justify-between">
        <span className="text-muted">{t("pages.applicationSubmission.summaryMethod")}</span>
        <span className="font-bold">Internal</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted">{t("pages.applicationSubmission.summarySource")}</span>
        <span className="font-bold">MatchIn Feed</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted">{t("pages.applicationSubmission.summaryTime")}</span>
        <span className="font-bold">Just now</span>
      </div>
    </div>
  );
}
