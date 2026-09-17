import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthCard from "@/components/shared/auth/AuthCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Eye,
  EyeOff,
  Circle,
  CircleCheck,
  CircleX,
  Clock,
  Loader2,
  Check,
  TriangleAlert,
  ShieldCheck,
  CircleHelp,
  Globe,
} from "lucide-react";

import { newPasswordSchema } from "@/features/Auth/schema/newPassword-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function Requirement({ met, children }) {
  return (
    <li
      className={`flex items-center gap-1.5 text-[11px] transition-colors ${
        met ? "text-emerald-600" : "text-slate-500"
      }`}
    >
      {met ? (
        <CircleCheck className="h-3 w-3 shrink-0" />
      ) : (
        <Circle className="h-3 w-3 shrink-0" />
      )}
      {children}
    </li>
  );
}

function StateView({ tone, icon, title, desc, children }) {
  const toneClasses = {
    blue: "bg-sky-100 text-sky-600",
    red: "bg-red-100 text-red-500",
    green: "bg-emerald-100 text-emerald-500",
  };

  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex w-full flex-col items-center text-center"
    >
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${toneClasses[tone]}`}
      >
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mb-6 text-[13px] leading-relaxed text-slate-500">{desc}</p>
      {children}
    </motion.div>
  );
}

// Main component

const FIELD_ORDER = ["password", "confirmPassword"];

export default function SetNewPassword() {
  const [state, setState] = useState("default");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(data) {
    console.log("New password submitted", data);
    setState("saving");
    setTimeout(() => setState("completed"), 1500);
  }

  const form = useForm({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const { errors } = form.formState;
  const firstErrorField = FIELD_ORDER.find((name) => errors[name]);

  function SequentialFormMessage({ name }) {
    const isActive = firstErrorField === name;
    return (
      <AnimatePresence mode="wait">
        {isActive && errors[name] && (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <FormMessage className="text-[11px] text-error" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-slate-800">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-stone-50 px-6 py-4 sm:px-8">
        <a
          href="#"
          className="flex items-center gap-2 text-sm font-semibold text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </a>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <Globe className="h-4 w-4" />
            English
          </button>
        </div>
      </header>

      {/* Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <AuthCard className="w-full max-w-120 px-6 py-6 shadow-sm sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            {state === "default" && (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex w-full flex-col items-center"
              >
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <RotateCw className="h-5 w-5" />
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

                <Form {...form}>
                  <form
                    noValidate
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="w-full"
                  >
                    {/* New password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="font-bold text-slate-900">
                            New Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative flex items-center">
                              <Lock className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-500" />
                              <Input
                                type={showNew ? "text" : "password"}
                                placeholder="Enter new password"
                                className="h-auto rounded-lg border-slate-300 py-2.5 pl-9 pr-9 text-sm text-slate-900 focus-visible:ring-slate-900"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowNew((value) => !value)}
                                className="absolute right-3 text-slate-500 hover:text-slate-700"
                                aria-label={
                                  showNew ? "Hide password" : "Show password"
                                }
                              >
                                {showNew ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <SequentialFormMessage name="password" />
                        </FormItem>
                      )}
                    />

                    {/* Confirm password */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="font-bold text-slate-900">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative flex items-center">
                              <Lock className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-500" />
                              <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm new password"
                                className="h-auto rounded-lg border-slate-300 py-2.5 pl-9 pr-9 text-sm text-slate-900 focus-visible:ring-slate-900"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirm((value) => !value)
                                }
                                className="absolute right-3 text-slate-500 hover:text-slate-700"
                                aria-label={
                                  showConfirm
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showConfirm ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <SequentialFormMessage name="confirmPassword" />
                        </FormItem>
                      )}
                    />

                    {/* Requirements */}

                    <Button
                      type="submit"
                      className="h-auto w-full gap-2 rounded-lg cursor-pointer bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-700"
                    >
                      Save &amp; Set Password
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {state === "verifying" && (
              <StateView
                tone="blue"
                icon={<Loader2 className="h-7 w-7 animate-spin" />}
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
              </StateView>
            )}

            {state === "expired" && (
              <StateView
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
              </StateView>
            )}

            {state === "saving" && <SavingPassword key="saving" />}

            {state === "completed" && (
              <StateView
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
              </StateView>
            )}

            {state === "error" && (
              <StateView
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
              </StateView>
            )}
          </AnimatePresence>

          {/* Security notice */}
          <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-3 text-[11px] leading-relaxed text-slate-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Advanced protection for your career data and application history
              adhering to top digital identity security standards and
              AES-256-bit encryption.
            </span>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
