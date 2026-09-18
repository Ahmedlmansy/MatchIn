import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

import {
  ArrowLeft,
  Mail,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  RotateCcw,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import logoText from '@/assets/logo/Full_logo.svg';
import logoIcon from '@/assets/logo/MatchIn_logo.svg';

// 1. Zod Schema
const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Please enter a valid email address.' })
  .email({ message: 'Please enter a valid email address.' });

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsTimeout(false);
    setMessage("");

    const result = emailSchema.safeParse(email);

    if (!result.success) {
      const errorMsg =
        result.error.issues[0]?.message ||
        "Please enter a valid email address.";
      setEmailError(errorMsg);
      return;
    }

    setEmailError("");
    setStatus(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMessage("A password reset link has been sent to your email.");
    } catch (error) {
      setIsTimeout(true);
      setMessage("Server connection failed. Please try again later.");
    } finally {
      setStatus(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#FDFBF9] text-[#1F365C] flex flex-col justify-between p-4 md:p-6 font-sans">
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center py-2">
        <div className="flex items-center gap-2">
          <img
            src={logoText}
            alt="SkillMatch Logo"
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            English
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block ml-1"></span>
          </button>

          <button
            type="button"
            className="p-1.5 text-gray-500 hover:text-gray-700"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <Link
            to="/login"
            className="flex items-center gap-1 text-[#1F365C] hover:underline ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto my-auto py-2">
        <div className="flex justify-between items-center text-xs mb-3 px-1 text-gray-500 font-medium">
          <Link
            to="/login"
            className="text-[#D06B4F] flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login Screen
          </Link>

          <span>256-bit SSL Secure Recovery</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100/80 text-gray-600 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D06B4F]"></span>
            Smart Career Platform
          </div>

          <img
            src={logoIcon}
            alt="SkillMatch Logo"
            className="h-14 w-auto mb-4 object-contain"
          />

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1F365C] mb-2 tracking-tight">
            Forgot Password?
          </h1>

          <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
            Enter your account's email address and we will send you a secure
            link to reset your password immediately.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full text-left space-y-4"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-[#1F365C]"
              >
                Professional Email
              </Label>

              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <Input
                  id="email"
                  type="text"
                  placeholder="tariq.mansour@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`pl-9 h-11 border-gray-200 focus-visible:ring-[#1F365C] ${
                    emailError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
              </div>

              {/* 3. الشرط هنا: لو في خطأ بيظهر النص الأحمر فقط، غير كده ما بيظهرش نص الـ 15 دقيقة */}
              {emailError ? (
                <p className="text-[11px] text-red-500 mt-1 font-medium">
                  {emailError}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={status}
              className="w-full h-11 bg-[#1F365C] hover:bg-[#162744] text-white font-medium flex items-center justify-center gap-2 rounded-lg"
            >
              {status ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Link...
                </>
              ) : isTimeout ? (
                <>
                  Retry Sending <RotateCcw className="w-4 h-4" />
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 mt-6 flex items-start gap-3 text-left">
            <div className="p-1 bg-white border border-gray-200 rounded-md text-[#1F365C] mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Advanced protection for your professional data. Saved with highest
              certified digital identity security standards.
            </p>
          </div>

          {message && (
            <div
              className={`w-full mt-4 p-3 rounded-xl text-xs text-center font-medium border ${
                message === "A password reset link has been sent to your email."
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-[#FDF2F2] border-[#FAD2D2] text-[#E05252]"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 py-4 space-y-1 -mt-4 -mb-6">
        <p>
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-[#D06B4F] font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>

        <p>
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="text-[#1F365C] font-semibold hover:underline"
          >
            Create New Account
          </Link>
        </p>
      </footer>
    </div>
  );
}