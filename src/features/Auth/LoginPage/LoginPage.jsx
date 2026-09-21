import AuthLayout from "@/components/layouts/auth/AuthLayout";
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import LoginFooter from "./components/LoginFooter";
import LoginHeading from "./components/LoginHeading";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import google from "@/assets/icons/google-icon.svg";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/Auth/schema/login-schema";
import { AnimatePresence, motion } from "framer-motion";
import { useLocalizedPath } from "@/utils/routes";
import { useTranslation } from "react-i18next";

const FIELD_ORDER = ["email", "password"];

export default function LoginPage() {
  const localizedPath = useLocalizedPath();
  const { t } = useTranslation("common");

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

  function handleLogin(e) {
    e.preventDefult();
  }

  const [isVisible, setIsVisible] = useState(false);
  function toggleVisiblty() {
    setIsVisible((prevState) => !prevState);
  }
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
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(handleLogin)}>
          <LoginHeading
            title={t("auth.login.welcome")}
            subTitle={t("auth.login.subtitle")}
          />
          <FieldGroup className="gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                    {t("auth.login.email")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("auth.login.emailPlaceholder")}
                      className="h-11.5 w-full rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-3.5 text-[16px] text-[#0f172a] outline-none transition-all placeholder:text-[#e2e8f0] focus-visible:border-[#1d3557]"
                      {...field}
                    />
                  </FormControl>
                  <SequentialFormMessage name="email" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                    {t("auth.login.password")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={isVisible ? "text" : "password"}
                        placeholder={t("auth.login.passwordPlaceholder")}
                        className="h-11.5 w-full rounded-[8px] border border-[#e2e8f0] bg-white px-4 py-3.5 text-[16px] text-[#0f172a] outline-none transition-all placeholder:text-[#e2e8f0] focus-visible:border-[#1d3557]"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-[50%] translate-y-[-50%]"
                        onClick={toggleVisiblty}
                        aria-label={
                          isVisible
                            ? t("auth.login.hidePassword")
                            : t("auth.login.showPassword")
                        }
                      >
                        {isVisible ? (
                          <EyeOff
                            width={20}
                            height={22}
                            className="cursor-pointer text-[#94a3b8] hover:text-[#0f172a]"
                          />
                        ) : (
                          <Eye
                            width={20}
                            height={22}
                            className="cursor-pointer text-[#94a3b8] hover:text-[#0f172a]"
                          />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <SequentialFormMessage name="password" />
                </FormItem>
              )}
            />
            <Field className="flex flex-row items-center justify-between w-full mb-1">
              <FieldLabel className="font-normal text-[#64748b] sm:text-[13px] text-[11px]">
                <FormField
                  control={form.control}
                  name="remember_me"
                  render={({ field }) => (
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-4 w-4 rounded-md p-0 outline-0 transition-all"
                      />
                    </FormControl>
                  )}
                />
                {t("auth.login.remember")}
              </FieldLabel>
              <Link
                to={localizedPath("/auth/forgot-password")}
                className="flex justify-end sm:text-[13px] text-[#2563eb] hover:underline font-medium text-[11px]"
              >
                {t("auth.login.forgot")}
              </Link>
            </Field>
            <Field>
              <Button
                type="submit"
                className=" flex justify-center gap-2 duration-200 h-11.5 p-3.5 bg-primary hover:bg-primary/90 rounded-[8px] text-[15px] font-semibold cursor-pointer"
              >
                {t("auth.login.submit")} <ArrowRight width={20} className="font-bold" />
              </Button>
            </Field>
            <FieldSeparator className="text-[#64748b] text-[12px] px-3.5 my-1">
              {t("auth.login.or")}
            </FieldSeparator>
            <Field>
              <Button className="p-3 h-11 bg-white hover:bg-[#f8fafc] border-[#e2e8f0] border rounded-[8px] text-[#0f172a] text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2.5 duration-200">
                <img src={google} width={18} height={18} />
                {t("auth.login.google")}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </Form>
    </AuthLayout>
  );
}
