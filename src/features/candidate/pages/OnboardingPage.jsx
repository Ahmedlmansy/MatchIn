import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import Status from "@/components/shared/Status";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";
import { useUpdateProfileMutation } from "@/features/candidate/hooks/useUpdateProfileMutation";
import { useUpdateCareerPreferencesMutation } from "@/features/candidate/hooks/useUpdateCareerPreferencesMutation";
import { ONBOARDING_STEP_FIELDS } from "@/features/candidate/shared/onboardingstepfields";
import StepperHeader from "../components/OnboardingPage/StepperHeader";
import OnboardingCompletedSummary from "../components/OnboardingPage/OnboardingCompletedSummary";
import ChipSelectStep from "../components/OnboardingPage/ChipSelectStep";

const TOTAL_STEPS = ONBOARDING_STEP_FIELDS.length;

const INITIAL_FORM_DATA = ONBOARDING_STEP_FIELDS.reduce(
  (acc, step) => ({ ...acc, [step.field]: "" }),
  {},
);

function OnboardingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-border bg-surface p-6 shadow-sm" aria-label="Loading onboarding">
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

      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-[#EFEDE8]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#EFEDE8]" />
        </div>

        <div className="space-y-1.5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-[#EFEDE8]" />
          <div className="h-12 w-full animate-pulse rounded bg-[#EFEDE8]" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-1/4 animate-pulse rounded bg-[#EFEDE8]" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-[#EFEDE8]" />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#EFEDE8]" />
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-[#EFEDE8]" />
        </div>
      </div>
    </div>
  );
}

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
  const [submitError, setSubmitError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const {
    data: profileData,
    isPending: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileQuery();

  const updateProfileMutation = useUpdateProfileMutation();
  const updateCareerPreferencesMutation = useUpdateCareerPreferencesMutation();

  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        jobTitle: profileData.jobTitle ?? profileData.job_title ?? prev.jobTitle,
        jobType: profileData.jobType ?? profileData.job_type ?? prev.jobType,
        workStyle: profileData.workStyle ?? profileData.work_style ?? prev.workStyle,
        location: profileData.location ?? prev.location,
        experience: profileData.experience ?? profileData.experience_level ?? prev.experience,
        goals: profileData.goals ?? profileData.career_goal ?? prev.goals,
      }));
    }
  }, [profileData]);

  const handleSubmit = async (nextData) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    const profilePayload = {
      job_title: nextData.jobTitle,
      country: nextData.country ?? "",
      state: nextData.state ?? "",
      city: nextData.city ?? "",
      date_of_birth: nextData.date_of_birth ?? null,
      gender: nextData.gender ?? null,
      github_url: nextData.github_url ?? null,
      linkedin_url: nextData.linkedin_url ?? null,
      military_status: nextData.military_status ?? null,
      professional_summary: nextData.professional_summary ?? null,
    };

    const careerPayload = {
      target_role: nextData.jobTitle,
      target_roles: nextData.jobTitle ? [nextData.jobTitle] : [],
      preferred_industries: nextData.preferred_industries ?? [],
      job_type: nextData.jobType ?? null,
      work_mode: nextData.workStyle ?? null,
      preferred_country: nextData.location ?? null,
      preferred_city: nextData.location ?? null,
      experience_level: nextData.experience ?? null,
      career_goal: nextData.goals ?? null,
      open_to_relocation: nextData.open_to_relocation ?? false,
    };

    try {
      // Step 1: Sequential save - Profile first
      if (!profileSaved) {
        try {
          await updateProfileMutation.mutateAsync(profilePayload);
          setProfileSaved(true);
        } catch (profileErr) {
          const message =
            profileErr?.message ??
            t(
              "ui.onboarding.profileSaveError",
              "Failed to save profile information. Please retry."
            );
          setSubmitError(message);
          return;
        }
      }

      // Step 2: Sequential save - Career preferences second
      try {
        await updateCareerPreferencesMutation.mutateAsync(careerPayload);
      } catch (careerErr) {
        const message =
          careerErr?.message ??
          t(
            "ui.onboarding.careerPreferencesSaveError",
            "Profile saved, but failed to save career preferences. Please retry."
          );
        setSubmitError(message);
        return;
      }

      // Step 3: Refresh profile to verify completion marker
      const refreshed = await refetchProfile();
      const nextProfile = refreshed?.data ?? profileData;
      const hasCompletionMarker =
        Boolean(nextProfile?.profile_completed_at) ||
        nextProfile?.profile_exists === true;

      if (!hasCompletionMarker) {
        setSubmitError(
          t(
            "ui.onboarding.incompleteError",
            "Your onboarding details were saved, but the backend did not mark the profile as complete yet. Please retry or contact support."
          )
        );
        return;
      }

      setCompleted(true);
    } catch (error) {
      const message =
        error?.message ??
        t("ui.onboarding.submitError", "Something went wrong while saving your profile.");
      setSubmitError(message);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleContinue = (field, value) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

    if (step === TOTAL_STEPS) {
      handleSubmit(nextData);
      return;
    }

    setStep((s) => s + 1);
  };

  const handlePrevious = () => setStep((s) => Math.max(1, s - 1));

  if (isProfileLoading) {
    return <OnboardingSkeleton />;
  }

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

      {submitError && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-xs text-error">
          {submitError}
        </div>
      )}

      <ChipSelectStep
        key={currentStepConfig.field}
        stepConfig={currentStepConfig}
        value={formData[currentStepConfig.field]}
        onContinue={handleContinue}
        onPrevious={handlePrevious}
        isFirstStep={step === 1}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}