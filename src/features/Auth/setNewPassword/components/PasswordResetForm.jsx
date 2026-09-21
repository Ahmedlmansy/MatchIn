import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FIELD_ORDER = ["password", "confirmPassword"];

function SequentialFormMessage({ name, errors }) {
  const firstErrorField = FIELD_ORDER.find((fieldName) => errors[fieldName]);
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

function PasswordField({
  control,
  name,
  label,
  placeholder,
  visible,
  onToggle,
  errors,
}) {
  const { t } = useTranslation("common");
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mb-4">
          <FormLabel className="font-bold text-slate-900">{label}</FormLabel>
          <FormControl>
            <div className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-500" />
              <Input
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                className="h-auto rounded-lg border-slate-300 py-2.5 pl-9 pr-9 text-sm text-slate-900 focus-visible:ring-slate-900"
                {...field}
              />
              <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 text-slate-500 hover:text-slate-700"
                aria-label={visible ? t("auth.reset.hidePassword") : t("auth.reset.showPassword")}
              >
                {visible ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </FormControl>
          <SequentialFormMessage name={name} errors={errors} />
        </FormItem>
      )}
    />
  );
}

export default function PasswordResetForm({
  form,
  onSubmit,
  showNew,
  showConfirm,
  onToggleNew,
  onToggleConfirm,
}) {
  const { t } = useTranslation("common");
  const { errors } = form.formState;

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        <PasswordField
          control={form.control}
          name="password"
          label={t("auth.reset.newPassword")}
          placeholder={t("auth.reset.newPasswordPlaceholder")}
          visible={showNew}
          onToggle={onToggleNew}
          errors={errors}
        />
        <PasswordField
          control={form.control}
          name="confirmPassword"
          label={t("auth.reset.confirmPassword")}
          placeholder={t("auth.reset.confirmPasswordPlaceholder")}
          visible={showConfirm}
          onToggle={onToggleConfirm}
          errors={errors}
        />
        <Button
          type="submit"
          className="h-auto w-full cursor-pointer gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90"
        >
          {t("auth.reset.save")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </form>
    </Form>
  );
}
