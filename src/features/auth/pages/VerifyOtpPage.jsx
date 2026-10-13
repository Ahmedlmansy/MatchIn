import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

import logoIcon from "@/assets/logo/MatchIn_logo.svg";
import AuthHeader from "@/features/auth/shared/AuthHeader";
import SecurityNotice from "@/features/auth/shared/SecurityNotice";
import { OtpView } from "@/features/auth/components/RegisterPage/OtpView";
import { useResendOtpMutation } from "@/features/auth/hooks/useResendOtpMutation";
import { useLocalizedPath } from "@/utils/routes";
import { useVerifyForgotOtpMutation } from "../hooks/useVerifyForgotOtpMutation";
import { useVerifyOtpMutation } from "../hooks/useVerifyOtpMutation";

/**
 * The OTP step, in one of two modes.
 *
 *   forgot-password (default) — verify a password-recovery code, then continue
 *                               to /reset-password with the reset token.
 *   verify-email             — verify an account's email, which is where
 *                               LoginPage sends a user whose login was rejected
 *                               with 403. This is a *different* code from a
 *                               different endpoint (POST /auth/verify-email-otp)
 *                               and it ends the flow by signing the user in
 *                               rather than by opening a reset form.
 *
 * Both hooks are called unconditionally — the mode only decides which one is
 * fired, so React's hook order never changes between renders.
 */
export default function VerifyOtpPage() {
  const { t } = useTranslation("common");
  const localizedPath = useLocalizedPath();
  const navigate = useNavigate();

  // Email + mode live in router state only — server flow data, not durable
  // client state, so never Redux. Both are gone on a refresh or a deep link.
  const { email = "", mode } = useLocation().state ?? {};
  const isEmailVerification = mode === "verify-email";

  const verifyEmail = useVerifyOtpMutation({
    onSuccess: (user) => {
      // A null user means the hook already handled it (it redirects to login
      // when the server verified the code without creating a session).
      if (user) navigate(localizedPath("/dashboard"), { replace: true });
    },
  });

  const verifyReset = useVerifyForgotOtpMutation({
    onSuccess: ({ token }) =>
      navigate(localizedPath("/auth/reset-password"), {
        state: { email, token },
      }),
  });
  const resend = useResendOtpMutation();

  const verify = isEmailVerification ? verifyEmail : verifyReset;

  const error = verify.isError
    ? verify.error?.message || t("auth.forgot.failure")
    : resend.isError
      ? resend.error?.message || t("auth.forgot.failure")
      : null;

  const copy = isEmailVerification ? "auth.verifyEmail" : "auth.forgot";

  // Where "back" goes depends on how the user got here: email verification is
  // entered from the login screen, password recovery from the request form.
  // Both flows therefore land the user where they still have context.
  const backPath = isEmailVerification ? "/auth/login" : "/auth/forgot-password";
  const backLabel = isEmailVerification
    ? t("auth.verifyEmail.backLabel")
    : t("auth.forgot.otpBack");

  const goBack = () => navigate(localizedPath(backPath));

  return (
    <div className="min-h-screen overflow-hidden bg-[#FDFBF9] text-primary flex flex-col justify-between p-4 md:p-6 font-sans">
      <AuthHeader bordered={false} backTo={backPath} backLabel={backLabel} />
      <main className="max-w-md w-full mx-auto my-auto py-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100/80 text-gray-600 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            {t("auth.forgot.badge")}
          </div>

          <img
            src={logoIcon}
            alt="MatchIn Logo"
            className="h-14 w-auto mb-4 object-contain"
          />

          {email ? (
            <div className="w-full">
              <OtpView
                email={email}
                onVerified={(code) => {
                  resend.reset();
                  verify.mutate({ email, code });
                }}
                onBack={goBack}
                onResend={() => {
                  verify.reset();
                  resend.mutate({ email });
                }}
                stepLabel={null}
                title={isEmailVerification ? t("auth.verifyEmail.title") : t("auth.forgot.otpTitle")}
                description={t(`${copy}.description`, { email })}
                isPending={verify.isPending}
                error={error}
              />
            </div>
          ) : (
            // Refreshed / directly-opened URL: router state is gone, so there is no code to send to.
            <div className="w-full space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                {isEmailVerification ? t("auth.verifyEmail.title") : t("auth.forgot.otpTitle")}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                {isEmailVerification ? t("auth.verifyEmail.missingEmail") : t("auth.forgot.otpMissingEmail")}
              </p>
              <Button
                onClick={goBack}
                className="w-full h-11 bg-primary hover:bg-[#162744] text-white font-medium rounded-lg cursor-pointer"
              >
                {isEmailVerification ? t("auth.verifyEmail.requestNew") : t("auth.forgot.otpRequestNew")}
              </Button>
            </div>
          )}

          <SecurityNotice text={t("auth.forgot.security")} className="w-full" />
        </div>
      </main>
    </div>
  );
}
