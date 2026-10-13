import React, { useEffect, useRef } from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import { BriefcaseBusiness } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LoginFooter from "@/features/auth/components/LoginPage/LoginFooter";
import LoginForm from "@/features/auth/components/LoginPage/LoginForm";
import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import { useLocalizedPath } from "@/utils/routes";

export default function LoginPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const localizedPath = useLocalizedPath();
  const emailRef = useRef("");

  const { mutate, isPending, isError, error, reset } = useLoginMutation({
    onAuthenticated: (user) => {
      // Check if there's a stored redirect location from RequireAuth
      const from = navigate.location?.state?.from?.pathname || localizedPath("/dashboard");
      navigate(from, { replace: true });
    },
  });

  // Handle 403 (unverified email) - redirect to OTP verification with email
  useEffect(() => {
    if (isError && error?.status === 403 && emailRef.current) {
      navigate(localizedPath("/auth/forgot-password/verify-otp"), {
        state: { email: emailRef.current },
        replace: true,
      });
      reset(); // Clear error so form can be used again
    }
  }, [isError, error, navigate, localizedPath, reset]);

  const handleSubmit = (data) => {
    emailRef.current = data.email;
    mutate(data);
  };

  return (
    <AuthLayout
      sidePanel={{
        imageSrc:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        badgeText: t("auth.side.badge"),
        badgeIcon: <BriefcaseBusiness width={13} height={13} />,
        title: t("auth.side.title"),
        description: t("auth.side.description"),
      }}
      footer={<LoginFooter />}
    >
      <LoginForm
        onSubmit={handleSubmit}
        isPending={isPending}
        serverError={isError ? error?.message : null}
        fieldErrors={error?.fieldErrors ?? null}
      />
    </AuthLayout>
  );
}

