import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  RotateCw,
  TriangleAlert,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthCard from "@/components/shared/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { newPasswordSchema } from "@/features/Auth/schema/newPassword-schema";
import PasswordResetForm from "../components/PasswordResetForm";
import ResetHeader from "../components/ResetHeader";
import ResetStateView from "../components/ResetStateView";
import SavingPassword from "../components/SavingPassword";
import SecurityNotice from "../components/SecurityNotice";
import logo from "@/assets/logo/MatchIn_logo.svg";

export default function SetNewPassword() {
  const [state, setState] = useState("default");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function handleSubmit(data) {
    console.log("New password submitted", data);
    setState("saving");
    setTimeout(() => setState("completed"), 1500);
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-slate-800">
      <ResetHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <AuthCard className="w-full max-w-120 px-6 py-6 shadow-sm sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            {state === "default" && (
              <div key="default" className="flex w-full flex-col items-center">
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white">
                    <img src={logo} className="h-full w-full" />
                  </div>
                  <span className="mb-1 flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Smart Career Path Platform
                  </span>
                  <h2 className="mt-3 mb-1.5 text-xl font-bold text-slate-900">
                    Set New Password
                  </h2>
                  <p className="max-w-[320px] text-xs leading-relaxed text-slate-500">
                    Please enter a strong password and confirm it to protect
                    your professional account on SkillMatch
                  </p>
                </div>
                <PasswordResetForm
                  form={form}
                  onSubmit={handleSubmit}
                  showNew={showNew}
                  showConfirm={showConfirm}
                  onToggleNew={() => setShowNew((value) => !value)}
                  onToggleConfirm={() => setShowConfirm((value) => !value)}
                />
              </div>
            )}

            {state === "verifying" && (
              <ResetStateView
                tone="blue"
                icon={<RotateCw className="h-7 w-7 animate-spin" />}
                title="Verifying Security Link..."
                desc="Please wait a moment while we validate your reset link security token."
              >
                <Button
                  variant="secondary"
                  onClick={() => setState("default")}
                  className="h-auto w-full gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Proceed to Form Manually
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </ResetStateView>
            )}

            {state === "expired" && (
              <ResetStateView
                tone="red"
                icon={<Clock className="h-7 w-7" />}
                title="Link Has Expired"
                desc="This password reset link is invalid or has expired for security reasons. Please request a new one."
              >
                <Button
                  onClick={() => setState("default")}
                  className="h-auto w-full gap-2 rounded-lg bg-orange-600 py-3 text-sm font-bold text-white hover:bg-orange-700"
                >
                  Request New Link
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </ResetStateView>
            )}

            {state === "saving" && <SavingPassword key="saving" />}

            {state === "completed" && (
              <ResetStateView
                tone="green"
                icon={<Check className="h-7 w-7" />}
                title="Onboarding Completed!"
                desc="Your password has been successfully updated, and your account set-up is now complete. You can access your personalized dashboard now."
              >
                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 text-sm font-bold text-white hover:bg-orange-700"
                >
                  Go to Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </ResetStateView>
            )}

            {state === "error" && (
              <ResetStateView
                tone="red"
                icon={<TriangleAlert className="h-7 w-7" />}
                title="Something Went Wrong"
                desc="We encountered an issue updating your password. Please check your network connection and try again."
              >
                <Button
                  onClick={() => setState("default")}
                  className="h-auto w-full gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Try Again
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
              </ResetStateView>
            )}
          </AnimatePresence>

          <SecurityNotice />
        </AuthCard>
      </main>
    </div>
  );
}
