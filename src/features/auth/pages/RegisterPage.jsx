import AuthLayout from "@/components/layouts/AuthLayout";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StepProgress } from "@/features/auth/components/RegisterPage/step-progress";
import { RegisterStep } from "@/features/auth/components/RegisterPage/RegisterStep";
import { BriefcaseBusiness } from "lucide-react";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("common");

  const [step, setStep] = useState(0); // 0 = form+otp, 1 = done

  const handleAccountPhaseChange = (phase) => {
    // Step 0 is the account form, step 1 is the OTP screen — both live inside
    // RegisterStep, so the shared progress bar has to follow the phase.
    setStep(phase === "otp" ? 1 : 0);
  };

  const handleAccountComplete = () => {
    // Account + OTP verified. Register wizard ends here.
    // Onboarding page (guarded by RequireOnboarding) handles profile completion.
    setStep(2);
  };

  // After OTP verification, user is authenticated. Navigate to dashboard.
  // The RequireOnboarding guard will redirect to onboarding if needed.
  useEffect(() => {
    if (step === 2) {
      navigate(localizedPath("/dashboard"), { replace: true });
    }
  }, [step, navigate, localizedPath]);

  return (
    <AuthLayout
      sidePanel={{
        title: t("auth.side.title"),
        description: t("auth.side.description"),
        imageSrc:
          "https://images.unsplash.com/photo-1633114128814-11fac33f707b?fm=jpg&q=80&w=1400&auto=format&fit=crop",
        imageAlt: "A person working on a laptop",
        badgeText: t("auth.side.badge"),
        badgeIcon: <BriefcaseBusiness width={13} height={13} />,
      }}
      additional={
        <StepProgress
          steps={t("auth.register.steps", { returnObjects: true })}
          currentStep={step}
        />
      }
      cardClassName={"justify-start"}
      footer={
        <p className="mx-auto w-full max-w-2xl px-6 pb-4 text-center text-[11.5px] leading-4 text-muted">
          {t("auth.register.haveAccount")}{" "}
          <Link
            to={localizedPath("/auth/login")}
            className="border-b border-border text-ink/80 hover:text-ink"
          >
            {t("auth.register.signIn")}
          </Link>
        </p>
      }
    >
      {step <= 1 && (
        <RegisterStep
          onPhaseChange={handleAccountPhaseChange}
          onComplete={handleAccountComplete}
        />
      )}

      {step === 2 && (
        <div className="text-center py-8">
          <div className="animate-pulse text-primary">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 text-muted">{t("auth.register.redirecting")}</p>
        </div>
      )}
    </AuthLayout>
  );
}
