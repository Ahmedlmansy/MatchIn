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

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  function toggleVisiblty() {
    setIsVisible((prevState) => !prevState);
  }
  return (
    <AuthLayout
      sidePanel={{
        imageSrc:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        badgeText: "Better Opportunities",
        badgeIcon: <BriefcaseBusiness width={13} height={13} />,
        title: "Great companies hire great people",
        description:
          "Build your career with the right opportunities and take the next step toward your future.",
      }}
      footer={<LoginFooter />}
    >
      <form>
        <LoginHeading
          title="Welcome Back"
          subTitle="Log in to your account to continue"
        />
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel
              htmlFor="email"
              className="text-[11px] font-bold uppercase text-[#64748b] tracking-[0.5px]"
            >
              Email Address
            </FieldLabel>
            <Input
              className="w-full h-11.5 px-4 py-3.5 text-[16px] bg-white transition-all text-[#0f172a] border border-[#e2e8f0] rounded-[8px] outline-none placeholder:text-[#e2e8f0] focus-visible:border-[#1d3557]"
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel
              htmlFor="password"
              className="text-[11px] font-bold uppercase text-[#64748b] tracking-[0.5px]"
            >
              Password
            </FieldLabel>
            <div className="relative">
              <Input
                className="w-full h-11.5 px-4 py-3.5 text-[16px] bg-white transition-all text-[#0f172a] border border-[#e2e8f0] rounded-[8px] outline-none placeholder:text-[#e2e8f0] focus-visible:border-[#1d3557]"
                type={isVisible ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-[50%] translate-y-[-50%]"
                onClick={toggleVisiblty}
              >
                {isVisible ? (
                  <EyeOff
                    width={20}
                    height={22}
                    className="text-[#94a3b8] text-[15px] cursor-pointer hover:text-[#0f172a]"
                  />
                ) : (
                  <Eye
                    width={20}
                    height={22}
                    className="text-[#94a3b8] text-[15px] cursor-pointer hover:text-[#0f172a]"
                  />
                )}
              </button>
            </div>
          </Field>
          <Field className="flex flex-row items-center justify-between w-full mb-1">
            <FieldLabel className="font-normal text-[#64748b] sm:text-[13px] text-[11px]">
              <Input
                className="w-4 h-4 transition-all p-0 rounded-none outline-0 checked:accent-[#1d3557]"
                type="checkbox"
                id="remember_me"
                name="remember_me"
              />
              Remember me
            </FieldLabel>
            <Link
              to="/auth/forgot-password"
              className="flex justify-end sm:text-[13px] text-[#2563eb] hover:underline font-medium text-[11px]"
            >
              Forgot password?
            </Link>
          </Field>
          <Field>
            <Button className=" flex justify-center gap-2 duration-200 h-11.5 p-3.5 bg-[#1d3557] hover:bg-[#112240] rounded-[8px] text-[15px] font-semibold cursor-pointer">
              Log In <ArrowRight width={20} className="font-bold" />
            </Button>
          </Field>
          <FieldSeparator className="text-[#64748b] text-[12px] px-3.5 my-1">
            or continue with
          </FieldSeparator>
          <Field>
            <Button className="p-3 h-11 bg-white hover:bg-[#f8fafc] border-[#e2e8f0] border rounded-[8px] text-[#0f172a] text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2.5 duration-200">
              <img src={google} width={18} height={18} />
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
