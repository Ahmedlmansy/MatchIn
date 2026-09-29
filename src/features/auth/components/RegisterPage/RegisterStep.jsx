import * as React from "react";
import { useState } from "react";

import { RegisterFormView } from "./RegisterFormView";
import { OtpView } from "./OtpView";
import { useRegisterMutation } from "@/features/auth/hooks/useRegisterMutation";

/**
 * RegisterStep
 * Wraps two internal phases — "form" then "otp" — as a single wizard
 * step, since verifying the email is tightly coupled to the account
 * form that was just submitted.
 *
 * onComplete(data)      — called once the OTP is verified.
 *   data = { name, email, password, otpCode }
 * onPhaseChange(phase)  — lets the parent wizard advance a shared
 *   progress bar when this step moves between "form" and "otp".
 */
export function RegisterStep({ onComplete, onPhaseChange }) {
  const [phase, setPhase] = useState("form"); // "form" | "otp"
  const [registerData, setRegisterData] = useState(null);

  const goToPhase = (next) => {
    setPhase(next);
    onPhaseChange?.(next);
  };

  // Real register call. Success only means "email + password accepted, OTP
  // sent" — it does NOT authenticate the user, so nothing touches Redux here.
  const registerMutation = useRegisterMutation({
    onVerificationStep: () => goToPhase("otp"),
  });

  const handleRegisterSubmit = (data) => {
    setRegisterData(data); // keep the submitted fields for the OTP screen + final onComplete
    registerMutation.mutate(data);
  };

  const handleOtpVerified = async (code) => {
    // TODO: call the verify-email-otp API here — next step, not this one
    onComplete?.({ ...registerData, otpCode: code });
  };

  const handleResend = () => {
    // TODO: call the resend-email-otp API here — next step, not this one
  };

  if (phase === "otp") {
    return (
      <OtpView
        email={registerData?.email}
        onVerified={handleOtpVerified}
        onBack={() => goToPhase("form")}
        onResend={handleResend}
      />
    );
  }

  return (
    <RegisterFormView
      onSubmit={handleRegisterSubmit}
      isPending={registerMutation.isPending}
      fieldErrors={registerMutation.message ?? null}
      serverError={
        registerMutation.error && !registerMutation.error.fieldErrors
          ? registerMutation.error.message
          : null
      }
    />
  );
}
