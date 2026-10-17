import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ImagePlus,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Save,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  I18nField,
  PlainField,
} from "@/features/admin/components/CmsHomePage/CmsFields";
import CmsToastStack from "@/features/admin/components/CmsHomePage/ToastStack";

const DRAFT_KEY = "cms:auth:draft";
const LANGS = [
  ["en", "English"],
  ["ar", "العربية"],
];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const EASE = [0.22, 1, 0.36, 1];

const translated = (en, ar = "") => ({ en, ar });

const DEFAULTS = {
  side: {
    badge: translated("Better Opportunities", "فرص أفضل"),
    title: translated(
      "Great companies hire great people",
      "الشركات العظيمة توظف الأشخاص المميزين",
    ),
    description: translated(
      "Build your career with the right opportunities and take the next step toward your future.",
      "ابنِ مسيرتك المهنية مع الفرص المناسبة وخذ خطوتك التالية نحو مستقبلك.",
    ),
  },
  login: {
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    welcome: translated("Welcome Back", "مرحبًا بعودتك"),
    subtitle: translated(
      "Log in to your account to continue",
      "سجّل الدخول إلى حسابك للمتابعة",
    ),
    remember: translated("Remember me", "تذكرني"),
    forgot: translated("Forgot password?", "هل نسيت كلمة المرور؟"),
    submit: translated("Log In", "تسجيل الدخول"),
    or: translated("or continue with", "أو تابع باستخدام"),
    google: translated("Continue with Google", "المتابعة باستخدام Google"),
    terms: translated(
      "By signing in, you agree to MatchIn's",
      "بتسجيل الدخول، أنت توافق على",
    ),
    termsLink: translated("Terms", "الشروط"),
    privacyLink: translated("Privacy Policy", "سياسة الخصوصية"),
    noAccount: translated("Don't have an account?", "ليس لديك حساب؟"),
    create: translated("Create an account →", "إنشاء حساب ←"),
  },
  register: {
    image:
      "https://images.unsplash.com/photo-1633114128814-11fac33f707b?fm=jpg&q=80&w=1400&auto=format&fit=crop",
    step: translated("STEP {{current}} OF 4", "الخطوة {{current}} من 4"),
    createTitle: translated("Create your account", "أنشئ حسابك"),
    createDescription: translated(
      "Start with the basics — you can round out your profile next.",
      "ابدأ بالأساسيات — يمكنك إكمال ملفك الشخصي لاحقًا.",
    ),
    agree: translated("I agree to MatchIn", "أوافق على"),
    terms: translated("Terms", "الشروط"),
    privacy: translated("Privacy Policy", "سياسة الخصوصية"),
    submitting: translated("Creating account…", "جارٍ إنشاء الحساب…"),
    submit: translated("Create account", "إنشاء الحساب"),
    haveAccount: translated("Already have an account?", "لديك حساب بالفعل؟"),
    signIn: translated("Sign in", "تسجيل الدخول"),
    verifyTitle: translated("Verify your email", "تأكيد بريدك الإلكتروني"),
    verifyDescription: translated(
      "We sent a 6-digit code to {{email}}. Enter it below to continue.",
      "أرسلنا رمزًا من 6 أرقام إلى {{email}}. أدخله أدناه للمتابعة.",
    ),
    yourEmail: translated("your email", "بريدك الإلكتروني"),
    resendIn: translated("Resend code in", "إعادة إرسال الرمز خلال"),
    resend: translated("Resend code", "إعادة إرسال الرمز"),
    back: translated("Back", "رجوع"),
    verify: translated("Verify & continue", "تأكيد ومتابعة"),
    uploadTitle: translated("Upload your CV", "ارفع سيرتك الذاتية"),
    uploadDescription: translated(
      "We'll read it once, privately, to pull out your skills and pre-fill your profile.",
      "سنقرأها مرة واحدة وبخصوصية لاستخراج مهاراتك وتعبئة ملفك الشخصي.",
    ),
    uploadLabel: translated("UPLOAD CV", "رفع السيرة الذاتية"),
    uploadHelp: translated(
      "PDF or DOCX, up to 10MB. This lets us auto-fill your profile and match you to better roles.",
      "PDF أو DOCX، بحد أقصى 10MB. يساعدنا ذلك على تعبئة ملفك ومطابقتك مع فرص أفضل.",
    ),
    drop: translated("Drop your CV here, or", "أفلت سيرتك هنا، أو"),
    browse: translated("browse", "تصفح"),
    fileLimit: translated(
      "PDF or DOCX, up to 10MB",
      "PDF أو DOCX، بحد أقصى 10MB",
    ),
    reading: translated("Reading…", "جارٍ القراءة…"),
    ready: translated("Ready", "جاهز"),
    remove: translated("Remove", "إزالة"),
    browseJobs: translated("Browse Jobs", "تصفح الوظائف"),
    completeProfile: translated("Complete Profile", "إكمال الملف الشخصي"),
    profileReading: translated("Reading your CV", "جارٍ قراءة سيرتك"),
    profileTitle: translated("Complete your profile", "أكمل ملفك الشخصي"),
    profileReadingDescription: translated(
      "Our model is scanning for roles, tools, and skills — this takes a few seconds.",
      "نبحث عن الأدوار والأدوات والمهارات — سيستغرق ذلك بضع ثوانٍ.",
    ),
    profileDescription: translated(
      "Here's what we found — review your skills and profile details below before finishing up.",
      "إليك ما وجدناه — راجع مهاراتك وتفاصيل ملفك قبل الإنهاء.",
    ),
    analyzing: translated("Analyzing {{file}}", "تحليل {{file}}"),
    yourProfile: translated("your profile", "ملفك الشخصي"),
    cvAnalyzed: translated("CV analyzed", "تم تحليل السيرة الذاتية"),
    extracting: translated(
      "Extracting your skills and experience…",
      "جارٍ استخراج مهاراتك وخبراتك…",
    ),
    extracted: translated(
      "Your profile is ready to review.",
      "ملفك الشخصي جاهز للمراجعة.",
    ),
    skillsSummary: translated(
      "{{found}} skills found · {{matched}} matched",
      "تم العثور على {{found}} مهارة · تطابقت {{matched}}",
    ),
    matchedSkills: translated("MATCHED SKILLS", "المهارات المتطابقة"),
    growth: translated("GROWTH OPPORTUNITIES", "فرص التطور"),
    profile: translated("PROFILE DETAILS", "تفاصيل الملف الشخصي"),
    jobTitle: translated("Target job title", "المسمى الوظيفي المستهدف"),
    jobTitlePlaceholder: translated(
      "e.g. Frontend Developer",
      "مثال: مطور واجهات أمامية",
    ),
    location: translated("Location", "الموقع"),
    locationPlaceholder: translated("City, Country", "المدينة، الدولة"),
    experience: translated("Experience", "الخبرة"),
    select: translated("Select experience", "اختر مستوى الخبرة"),
    bio: translated("Professional summary", "نبذة مهنية"),
    optional: translated("optional", "اختياري"),
    bioPlaceholder: translated(
      "Tell employers about your experience and goals…",
      "أخبر أصحاب العمل عن خبراتك وأهدافك…",
    ),
    dashboard: translated("Finish profile", "إنهاء الملف الشخصي"),
  },
};

// Labels are translation keys, not copy: this editor's own chrome. The
// DEFAULTS block above is the content being edited and stays literal.
const FIELD_SECTIONS = {
  shared: [
    { key: "badge", labelKey: "pages.admin.authSettings.fields.shared.badge" },
    { key: "title", labelKey: "pages.admin.authSettings.fields.shared.title" },
    {
      key: "description",
      labelKey: "pages.admin.authSettings.fields.shared.description",
      multiline: true,
    },
  ],
  login: [
    {
      key: "welcome",
      labelKey: "pages.admin.authSettings.fields.login.welcome",
    },
    {
      key: "subtitle",
      labelKey: "pages.admin.authSettings.fields.login.subtitle",
    },
    {
      key: "remember",
      labelKey: "pages.admin.authSettings.fields.login.remember",
    },
    { key: "forgot", labelKey: "pages.admin.authSettings.fields.login.forgot" },
    { key: "submit", labelKey: "pages.admin.authSettings.fields.login.submit" },
    { key: "or", labelKey: "pages.admin.authSettings.fields.login.or" },
    { key: "google", labelKey: "pages.admin.authSettings.fields.login.google" },
    { key: "terms", labelKey: "pages.admin.authSettings.fields.login.terms" },
    {
      key: "termsLink",
      labelKey: "pages.admin.authSettings.fields.login.termsLink",
    },
    {
      key: "privacyLink",
      labelKey: "pages.admin.authSettings.fields.login.privacyLink",
    },
    {
      key: "noAccount",
      labelKey: "pages.admin.authSettings.fields.login.noAccount",
    },
    { key: "create", labelKey: "pages.admin.authSettings.fields.login.create" },
  ],
  register: [
    { key: "step", labelKey: "pages.admin.authSettings.fields.register.step" },
    {
      key: "createTitle",
      labelKey: "pages.admin.authSettings.fields.register.createTitle",
    },
    {
      key: "createDescription",
      labelKey: "pages.admin.authSettings.fields.register.createDescription",
      multiline: true,
    },
    {
      key: "agree",
      labelKey: "pages.admin.authSettings.fields.register.agree",
    },
    {
      key: "terms",
      labelKey: "pages.admin.authSettings.fields.register.terms",
    },
    {
      key: "privacy",
      labelKey: "pages.admin.authSettings.fields.register.privacy",
    },
    {
      key: "submit",
      labelKey: "pages.admin.authSettings.fields.register.submit",
    },
    {
      key: "submitting",
      labelKey: "pages.admin.authSettings.fields.register.submitting",
    },
    {
      key: "haveAccount",
      labelKey: "pages.admin.authSettings.fields.register.haveAccount",
    },
    {
      key: "signIn",
      labelKey: "pages.admin.authSettings.fields.register.signIn",
    },
    {
      key: "verifyTitle",
      labelKey: "pages.admin.authSettings.fields.register.verifyTitle",
    },
    {
      key: "verifyDescription",
      labelKey: "pages.admin.authSettings.fields.register.verifyDescription",
      multiline: true,
    },
    {
      key: "yourEmail",
      labelKey: "pages.admin.authSettings.fields.register.yourEmail",
    },
    {
      key: "resendIn",
      labelKey: "pages.admin.authSettings.fields.register.resendIn",
    },
    {
      key: "resend",
      labelKey: "pages.admin.authSettings.fields.register.resend",
    },
    { key: "back", labelKey: "pages.admin.authSettings.fields.register.back" },
    {
      key: "verify",
      labelKey: "pages.admin.authSettings.fields.register.verify",
    },
    {
      key: "uploadTitle",
      labelKey: "pages.admin.authSettings.fields.register.uploadTitle",
    },
    {
      key: "uploadDescription",
      labelKey: "pages.admin.authSettings.fields.register.uploadDescription",
      multiline: true,
    },
    {
      key: "uploadLabel",
      labelKey: "pages.admin.authSettings.fields.register.uploadLabel",
    },
    {
      key: "uploadHelp",
      labelKey: "pages.admin.authSettings.fields.register.uploadHelp",
      multiline: true,
    },
    { key: "drop", labelKey: "pages.admin.authSettings.fields.register.drop" },
    {
      key: "browse",
      labelKey: "pages.admin.authSettings.fields.register.browse",
    },
    {
      key: "fileLimit",
      labelKey: "pages.admin.authSettings.fields.register.fileLimit",
    },
    {
      key: "reading",
      labelKey: "pages.admin.authSettings.fields.register.reading",
    },
    {
      key: "ready",
      labelKey: "pages.admin.authSettings.fields.register.ready",
    },
    {
      key: "remove",
      labelKey: "pages.admin.authSettings.fields.register.remove",
    },
    {
      key: "browseJobs",
      labelKey: "pages.admin.authSettings.fields.register.browseJobs",
    },
    {
      key: "completeProfile",
      labelKey: "pages.admin.authSettings.fields.register.completeProfile",
    },
    {
      key: "profileReading",
      labelKey: "pages.admin.authSettings.fields.register.profileReading",
    },
    {
      key: "profileTitle",
      labelKey: "pages.admin.authSettings.fields.register.profileTitle",
    },
    {
      key: "profileReadingDescription",
      labelKey:
        "pages.admin.authSettings.fields.register.profileReadingDescription",
      multiline: true,
    },
    {
      key: "profileDescription",
      labelKey: "pages.admin.authSettings.fields.register.profileDescription",
      multiline: true,
    },
    {
      key: "analyzing",
      labelKey: "pages.admin.authSettings.fields.register.analyzing",
      multiline: true,
    },
    {
      key: "yourProfile",
      labelKey: "pages.admin.authSettings.fields.register.yourProfile",
    },
    {
      key: "cvAnalyzed",
      labelKey: "pages.admin.authSettings.fields.register.cvAnalyzed",
    },
    {
      key: "extracting",
      labelKey: "pages.admin.authSettings.fields.register.extracting",
    },
    {
      key: "extracted",
      labelKey: "pages.admin.authSettings.fields.register.extracted",
    },
    {
      key: "skillsSummary",
      labelKey: "pages.admin.authSettings.fields.register.skillsSummary",
    },
    {
      key: "matchedSkills",
      labelKey: "pages.admin.authSettings.fields.register.matchedSkills",
    },
    {
      key: "growth",
      labelKey: "pages.admin.authSettings.fields.register.growth",
    },
    {
      key: "profile",
      labelKey: "pages.admin.authSettings.fields.register.profile",
    },
    {
      key: "jobTitle",
      labelKey: "pages.admin.authSettings.fields.register.jobTitle",
    },
    {
      key: "jobTitlePlaceholder",
      labelKey: "pages.admin.authSettings.fields.register.jobTitlePlaceholder",
    },
    {
      key: "location",
      labelKey: "pages.admin.authSettings.fields.register.location",
    },
    {
      key: "locationPlaceholder",
      labelKey: "pages.admin.authSettings.fields.register.locationPlaceholder",
    },
    {
      key: "experience",
      labelKey: "pages.admin.authSettings.fields.register.experience",
    },
    {
      key: "select",
      labelKey: "pages.admin.authSettings.fields.register.select",
    },
    { key: "bio", labelKey: "pages.admin.authSettings.fields.register.bio" },
    {
      key: "optional",
      labelKey: "pages.admin.authSettings.fields.register.optional",
    },
    {
      key: "bioPlaceholder",
      labelKey: "pages.admin.authSettings.fields.register.bioPlaceholder",
      multiline: true,
    },
    {
      key: "dashboard",
      labelKey: "pages.admin.authSettings.fields.register.dashboard",
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isTranslated(value) {
  return value && typeof value === "object" && ("en" in value || "ar" in value);
}

function mergeDefaults(saved) {
  const defaults = clone(DEFAULTS);
  return {
    ...defaults,
    ...saved,
    side: { ...defaults.side, ...saved.side },
    login: { ...defaults.login, ...saved.login },
    register: { ...defaults.register, ...saved.register },
  };
}

function SettingCard({ title, description, open, onToggle, children }) {
  return (
    <motion.section
      layout
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutGrid className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] text-ink">{title}</b>
          <span className="block truncate text-xs text-muted">
            {description}
          </span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 text-muted transition", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-border"
          >
            <div className="grid gap-5 px-5 pb-5 pt-4 sm:grid-cols-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function ImageField({ label, value, onChange, onError }) {
  const { t } = useTranslation("dashboard");

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError(t("pages.admin.authSettings.uploadError.notImage"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      onError(t("pages.admin.authSettings.uploadError.tooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.onerror = () =>
      onError(t("pages.admin.authSettings.uploadError.unreadable"));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <PlainField
        label={t("pages.admin.authSettings.urlLabel", { label })}
        value={value}
        onChange={onChange}
        type="url"
      />
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <img
            src={value}
            alt={t("pages.admin.authSettings.previewLabel", { label })}
            className="h-16 w-24 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-border bg-background text-muted">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-background">
          <Upload className="h-4 w-4" />
          {t("pages.admin.authSettings.upload")}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
          />
        </label>
      </div>
    </div>
  );
}

export default function AuthSettings() {
  const { t } = useTranslation("dashboard");
  const { t: tCommon } = useTranslation("common");
  const [bootState] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw
        ? {
            state: mergeDefaults(JSON.parse(raw)),
            restored: true,
            loadError: false,
          }
        : { state: clone(DEFAULTS), restored: false, loadError: false };
    } catch {
      return { state: clone(DEFAULTS), restored: false, loadError: true };
    }
  });
  const [state, setState] = useState(bootState.state);
  const [dirty, setDirty] = useState(bootState.restored);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [viewLang, setViewLang] = useState("both");
  const [activeTab, setActiveTab] = useState("login");
  const [openSections, setOpenSections] = useState(
    () => new Set(["shared", "login", "register"]),
  );
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, kind = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, msg, kind }]);
    setTimeout(
      () => setToasts((items) => items.filter((item) => item.id !== id)),
      3200,
    );
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const patch = (section, key, value) => {
    setState((current) => ({
      ...current,
      [section]: { ...current[section], [key]: value },
    }));
    setDirty(true);
  };

  const toggleSection = (id) => {
    setOpenSections((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const matchesQuery = (section, field) => {
    if (!query.trim()) return true;
    const searchable = `${section} ${field.label} ${JSON.stringify(
      state[section]?.[field.key] ?? "",
    )}`;
    return searchable.toLowerCase().includes(query.trim().toLowerCase());
  };

  const visibleFields = {
    shared: FIELD_SECTIONS.shared.filter((field) =>
      matchesQuery("side", field),
    ),
    login: FIELD_SECTIONS.login.filter((field) => matchesQuery("login", field)),
    register: FIELD_SECTIONS.register.filter((field) =>
      matchesQuery("register", field),
    ),
  };

  const renderTextFields = (section, fields) =>
    fields.map((field) => (
      <I18nField
        key={field.key}
        label={t(field.labelKey)}
        value={state[section][field.key]}
        onChange={(value) => patch(section, field.key, value)}
        multiline={field.multiline}
        viewLang={viewLang}
        langs={LANGS}
        isI18n={isTranslated}
      />
    ));

  // NOTE: this screen has no backend. Like CmsHomePage it persists the document
  // to localStorage and nothing else — there is no auth-settings endpoint in
  // the API contract.
  //
  // The two buttons were byte-for-byte identical writes that both reported
  // success, and the non-draft one said "Auth settings saved." as though the
  // login and register screens had been changed for real users. They have not.
  // Both now say what actually happened, in this browser.
  const save = async (asDraft = false) => {
    setSaving(true);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      setDirty(false);
      toast(
        asDraft
          ? t("pages.admin.authSettings.draftSaved")
          : t("pages.admin.authSettings.draftSavedDetail"),
        "warn",
      );
    } catch (error) {
      toast(
        t("pages.admin.authSettings.saveFailed", { message: error.message }),
        "err",
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!window.confirm(t("pages.admin.authSettings.resetConfirm"))) return;
    setState(clone(DEFAULTS));
    setDirty(true);
    toast(t("pages.admin.authSettings.defaultsRestored"), "warn");
  };

  const renderImage = (section) => (
    <ImageField
      label={t("pages.admin.authSettings.sidePanelImage", {
        page: t(
          `pages.admin.authSettings.tabs.${section === "login" ? "loginLabel" : "registerLabel"}`,
        ),
      })}
      value={state[section].image}
      onChange={(value) => patch(section, "image", value)}
      onError={(message) => toast(message, "err")}
    />
  );

  const renderTabSections = (section) => {
    const fields = visibleFields[section];
    const showShared = visibleFields.shared.length > 0;
    const showPage = fields.length > 0 || !query.trim();
    if (!showShared && !showPage) {
      return (
        <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
          {t("pages.admin.authSettings.noMatches")}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {showShared && (
          <SettingCard
            title={t("pages.admin.authSettings.sections.shared.label")}
            description={t(
              "pages.admin.authSettings.sections.shared.description",
            )}
            open={openSections.has("shared") || !!query}
            onToggle={() => toggleSection("shared")}
          >
            {renderTextFields("side", visibleFields.shared)}
          </SettingCard>
        )}
        {showPage && (
          <SettingCard
            title={t(`pages.admin.authSettings.sections.${section}.label`)}
            description={t(
              `pages.admin.authSettings.sections.${section}.description`,
            )}
            open={openSections.has(section) || !!query}
            onToggle={() => toggleSection(section)}
          >
            {renderImage(section)}
            {renderTextFields(section, fields)}
          </SettingCard>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-ink">
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <h1 className="text-2xl font-bold text-primary">
            {t("pages.admin.authSettings.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("pages.admin.authSettings.subtitle")}
          </p>
          {bootState.loadError && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
            >
              {t("pages.admin.authSettings.loadFailed")}
            </p>
          )}
          {bootState.restored && (
            <p className="mt-3 text-xs text-warning">
              {t("pages.admin.authSettings.restored")}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("pages.admin.authSettings.searchPlaceholder")}
                className="pl-9"
              />
            </div>
            <select
              value={viewLang}
              onChange={(event) => setViewLang(event.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              aria-label={t("pages.admin.authSettings.languagesTitle")}
            >
              <option value="both">
                {tCommon("ui.adminEnums.languages.en")} +{" "}
                {tCommon("ui.adminEnums.languages.ar")}
              </option>
              {LANGS.map(([code]) => (
                <option key={code} value={code}>
                  {t("pages.admin.cmsEditor.langOnly", {
                    name: tCommon(`ui.adminEnums.languages.${code}`),
                  })}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto border-border"
              onClick={() =>
                setOpenSections(new Set(["shared", "login", "register"]))
              }
            >
              {t("pages.admin.authSettings.expandAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => setOpenSections(new Set())}
            >
              {t("pages.admin.authSettings.collapseAll")}
            </Button>
          </div>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-8 gap-5"
        >
          <div className="sticky top-0 z-10 h-auto rounded-2xl border border-border bg-surface/90 p-2 shadow-sm backdrop-blur-sm">
            <TabsList className="flex h-16! w-full justify-start gap-2 overflow-x-auto bg-transparent px-1">
              <TabsTrigger
                value="login"
                className="h-auto min-w-40 flex-col items-start gap-1 rounded-xl px-3 py-2 text-start text-muted after:hidden data-[state=active]:scale-[1.02] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <span className="text-sm font-semibold">
                  {t("pages.admin.authSettings.tabs.loginLabel")}
                </span>
                <span className="text-[10px] opacity-75">
                  {t("pages.admin.authSettings.tabs.loginSub")}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="h-auto min-w-40 flex-col items-start gap-1 rounded-xl px-3 py-2 text-start text-muted after:hidden data-[state=active]:scale-[1.02] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
              >
                <span className="text-sm font-semibold">
                  {t("pages.admin.authSettings.tabs.registerLabel")}
                </span>
                <span className="text-[10px] opacity-75">
                  {t("pages.admin.authSettings.tabs.registerSub")}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="login" className="mt-0">
            {renderTabSections("login")}
          </TabsContent>
          <TabsContent value="register" className="mt-0">
            {renderTabSections("register")}
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <span
            className={cn(
              "text-xs font-medium text-warning",
              !dirty && "invisible",
            )}
          >
            {t("pages.admin.authSettings.unsaved")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reset}
            className="ml-auto gap-1 border-border text-error hover:bg-background"
          >
            <RotateCcw className="h-4 w-4" />
            {t("pages.admin.authSettings.resetDefaults")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => save(true)}
            className="gap-1 border-border"
          >
            <Save className="h-4 w-4" />
            {t("pages.admin.authSettings.saveDraft")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={() => save()}
            className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t("pages.admin.authSettings.saveChanges")}
          </Button>
        </div>
      </main>

      <CmsToastStack
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((items) => items.filter((item) => item.id !== id))
        }
        ease={EASE}
      />
    </div>
  );
}
