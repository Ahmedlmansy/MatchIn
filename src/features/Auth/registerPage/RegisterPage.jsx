import AuthLayout from "@/components/layouts/auth/AuthLayout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StepProgress } from "./components/step-progress";
import { RegisterStep } from "./components/RegisterStep";
import { CvUploadStep } from "./components/CvUploadStep";
import { ProfileCompletionStep } from "./components/Profilecompletionstep";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [registerData, setRegisterData] = useState(null); // { fullName, email, password, otpCode }
  const [cvFile, setCvFile] = useState(null);

  const handleAccountPhaseChange = (phase) => {
    setStep(phase === "otp" ? 1 : 1);
  };

  const handleAccountComplete = (data) => {
    // TODO: account + otp were already verified inside RegisterStep;
    // this is just where the wizard advances once that's done.
    setRegisterData(data);
    setStep(2);
  };

  const handleCvComplete = (file) => {
    setCvFile(file);
    setStep(3);
  };

  const handleCvSkip = () => {
    // "Browse Jobs" bypasses profile completion entirely.
    navigate("/jobs");
  };

  const handleProfileBack = () => {
    setStep(0);
  };

  const handleProfileFinish = (profileData) => {
    // TODO: submit { ...registerData, cvFile, ...profileData } to the API
    navigate("/dashboard");
  };

  return (
    <AuthLayout
      sidePanel={{
        title: "Great companies hire great people",
        description:
          "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        imageSrc:
          "https://images.unsplash.com/photo-1633114128814-11fac33f707b?fm=jpg&q=80&w=1400&auto=format&fit=crop",
        imageAlt: "A person working on a laptop",
      }}
      additional={
        <StepProgress
          steps={[
            "Create account",
            "Verify email",
            "Upload CV",
            "Complete profile",
          ]}
          currentStep={step}
        />
      }
    >
      {step <= 1 && (
        <RegisterStep
          onPhaseChange={handleAccountPhaseChange}
          onComplete={handleAccountComplete}
        />
      )}

      {step === 2 && (
        <CvUploadStep onComplete={handleCvComplete} onSkip={handleCvSkip} />
      )}

      {step === 3 && (
        <ProfileCompletionStep
          cvFileName={cvFile?.name}
          onBack={handleProfileBack}
          onFinish={handleProfileFinish}
        />
      )}
    </AuthLayout>
  );
}
