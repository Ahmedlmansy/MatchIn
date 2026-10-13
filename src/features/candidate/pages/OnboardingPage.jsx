import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import ActionBanner from "@/components/shared/ActionBanner";
import Status from "@/components/shared/Status";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";

import { ONBOARDING_STEP_FIELDS } from "@/features/candidate/shared/onboardingstepfields";
import StepperHeader from "../components/OnboardingPage/StepperHeader";
import OnboardingCompletedSummary from "../components/OnboardingPage/OnboardingCompletedSummary";
import ChipSelectStep from "../components/OnboardingPage/ChipSelectStep";

const TOTAL_STEPS = ONBOARDING_STEP_FIELDS.length;

const INITIAL_FORM_DATA = ONBOARDING_STEP_FIELDS.reduce(
  (acc, step) => ({ ...acc, [step.field]: "" }),
  {},
);

/**
 * Skeleton loader for the onboarding page while profile data is being fetched.
 * Mirrors the exact layout of the onboarding card.
 */
function OnboardingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-border bg-surface p-6 shadow-sm" aria-label="Loading onboarding">
      {/* Stepper header skeleton */}
      <div className="mb-8">
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-[#EFEDE8]" />
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-primary animate-pulse" style={{ width: "16%" }} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-24 animate-pulse rounded bg-[#EFEDE8]" />
          ))}
        </div>
      </div>

      {/* Form content skeleton */}
      <div className="space-y-6">
        {/* Title + subtitle */}
        <div className="space-y-1.5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-[#EFEDE8]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#EFEDE8]" />
        </div>

        {/* Input field */}
        <div className="space-y-1.5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-[#EFEDE8]" />
          <div className="h-12 w-full animate-pulse rounded bg-[#EFEDE8]" />
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="h-3 w-1/4 animate-pulse rounded bg-[#EFEDE8]" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-[#EFEDE8]" />
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#EFEDE8]" />
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#EFEDE8]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Error state for when profile fetch fails.
 * Uses the shared Status component with a retry button.
 */
function OnboardingError({ message, onRetry }) {
  const { t } = useTranslation("common");

  return (
    <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <Status
        icon={<AlertCircle className="h-6 w-6" />}
        iconClassName="bg-error/10 text-error"
        title={t("ui.onboarding.loadErrorTitle", "Couldn't load profile")}
        subtitle={message}
        primaryButton={{
          label: t("ui.onboarding.retry", "Try again"),
          onClick: onRetry,
        }}
      />
    </div>
  );
}

export default function OnboardingPage() {
  const { t } = useTranslation("common");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [bannerStatus, setBannerStatus] = useState(null); // null | "loading" | "success" | "error"
  const [bannerText, setBannerText] = useState("");
  const [completed, setCompleted] = useState(false);

  // Fetch profile data for prefilling
  const {
    data: profileData,
    isPending: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileQuery();

  // Prefill form data when profile loads
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        ...profileData,
      }));
    }
  }, [profileData]);

  // TODO: replace with the real autosave API call
  const simulateSave = (label) => {
    if (!label) return;
    setBannerStatus("loading");
    setBannerText(t("ui.onboarding.saving", "Saving changes to server..."));
    window.setTimeout(() => {
      setBannerStatus("success");
      setBannerText(t("ui.onboarding.saved", { label: `Saved: "${label}"` }));
      window.setTimeout(() => setBannerStatus(null), 2200);
    }, 700);
  };

  const handleContinue = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    simulateSave(value);
    if (step === TOTAL_STEPS) {
      setCompleted(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrevious = () => setStep((s) => Math.max(1, s - 1));

  // Show skeleton while profile is loading
  if (isProfileLoading) {
    return <OnboardingSkeleton />;
  }

  // Show error state if profile fetch failed
  if (isProfileError) {
    return (
      <OnboardingError
        message={profileError?.message ?? t("ui.onboarding.loadErrorMessage", "Something went wrong. Please try again.")}
        onRetry={() => refetchProfile()}
      />
    );
  }

  if (completed) {
    return (
      <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-border bg-surface shadow-sm">
        <OnboardingCompletedSummary
          formData={formData}
          onEdit={() => {
            setCompleted(false);
            setStep(1);
          }}
        />
      </div>
    );
  }

  const currentStepConfig = ONBOARDING_STEP_FIELDS[step - 1];

  return (
    <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <StepperHeader currentStep={step} />

      <ActionBanner status={bannerStatus} text={bannerText} className="mb-4" />

      {/* key forces a fresh instance per step, so its internal input/error
          state doesn't leak from one step's field into the next */}
      <ChipSelectStep
        key={currentStepConfig.field}
        stepConfig={currentStepConfig}
        value={formData[currentStepConfig.field]}
        onContinue={handleContinue}
        onPrevious={handlePrevious}
        isFirstStep={step === 1}
      />
    </div>
  );
}