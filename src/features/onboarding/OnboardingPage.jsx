import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ONBOARDING_STEPS } from "@/constants/onboardingSteps";
import OnboardingCompletedSummary from "./components/OnboardingCompletedSummary";
import StepperHeader from "./components/StepperHeader";
import SavingIndicator from "./components/SavingIndicator";
import ActionBanner from "./components/ActionBanner";
import StepPlaceholder from "./components/StepPlaceholder";
import JobTitleStep from "./components/JobTitleStep";
import JobTypeStep from "./components/JobTypeStep";
import WorkStyleStep from "./components/WorkStyleStep";
import LocationStep from "./components/LocationStep";
import ExperienceStep from "./components/ExperienceStep";
import CareerGoalStep from "./components/CareerGoalStep";

const TOTAL_STEPS = ONBOARDING_STEPS.length;

const INITIAL_FORM_DATA = ONBOARDING_STEPS.reduce(
  (acc, step) => ({ ...acc, [step.field]: "" }),
  {},
);

const STEP_COMPONENTS = {
  1: JobTitleStep,
  2: JobTypeStep,
  3: WorkStyleStep,
  4: LocationStep,
  5: ExperienceStep,
  6: CareerGoalStep,
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [lastSaved, setLastSaved] = useState("");
  const [completed, setCompleted] = useState(false);

  // TODO: replace with the real autosave API call
  const simulateSave = (label) => {
    if (!label) return;
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("saved");
      setLastSaved(label);
      window.setTimeout(() => setSaveState("idle"), 2200);
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

  const currentStepMeta = ONBOARDING_STEPS[step - 1];
  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <StepperHeader currentStep={step} />

      <SavingIndicator show={saveState === "saving"} />

      {/* ActionBanner replaces SuccessToast — handles loading / error / success */}
      <ActionBanner
        status={
          saveState === "idle"
            ? null
            : saveState === "saving"
              ? "loading"
              : "success"
        }
        text={saveState === "saved" ? `Saved: "${lastSaved}"` : undefined}
        className="mb-4"
      />

      <AnimatePresence mode="wait">
        {StepComponent ? (
          <StepComponent
            key={step}
            value={formData[currentStepMeta.field]}
            onContinue={handleContinue}
            onPrevious={handlePrevious}
            isFirstStep={step === 1}
          />
        ) : (
          <StepPlaceholder
            key={step}
            label={currentStepMeta.label}
            field={currentStepMeta.field}
            onContinue={handleContinue}
            onPrevious={handlePrevious}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
