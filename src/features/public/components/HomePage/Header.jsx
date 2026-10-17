import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

import { NAV_LINKS } from "@/features/public/shared/navLinks";
import LogoNavy from "@/assets/logo/Full_logo_navy.svg";
import { useTranslation } from "react-i18next";
import { useLocalizedPath } from "@/utils/routes";
import LanguageButton from "@/components/shared/LanguageButton";

export default function Header()
{
  const [isScrolled, setIsScrolled] = useState(false);
    const { lang } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const localizedPath = useLocalizedPath();

    useEffect(() => {
      const updateScrollState = () => setIsScrolled(window.scrollY > 24);

      updateScrollState();
      window.addEventListener("scroll", updateScrollState, { passive: true });
      return () => window.removeEventListener("scroll", updateScrollState);
    }, []);

    // Swap only the locale segment so the visitor keeps the page (and the
    // section anchor) they were on. `auth.switchLanguage` in the locale files
    // already holds the *target* language's own name, which is what
    // LanguageButton renders as its accessible name.
    const handleLanguageChange = (newLang) => {
      const segments = location.pathname.split("/");

      segments[1] = newLang;

      navigate(`${segments.join("/")}${location.search}${location.hash}`);
    };

  const { t } = useTranslation("common");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-md">
      {/* Two compositions from one flat row of children, so the language
          button is never rendered twice (a duplicated control would show up as
          two tab stops and two matching aria-labels).

            Below lg — logo pulled out of flow and centred, leaving the row's
            only in-flow children the language button and the menu trigger,
          which `justify-between` pushes to opposite edges.

            From lg — the logo rejoins the row, and the nav's inline-end margin
          eats all the free space. Auto margins consume free space before
          `justify-content` ever sees it, so that margin is what groups
          logo+nav against the actions. It is logical (`me-*`), so it groups
          correctly on the right-hand side under RTL too.

          `left-1/2` on the logo is deliberately physical: the bar is symmetric,
          so its physical centre is the same point in both directions, and the
          matching `-translate-x-1/2` then centres it identically either way.
          Using `start-1/2` would have needed an `rtl:` translate override. */}
      <div
        className={`relative mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-6 transition-[height] duration-300 md:px-10 lg:gap-4 lg:px-16 ${
          isScrolled ? "h-16" : "h-[72px] lg:h-20"
        }`}
      >
        {/* Centred below lg, first in flow from lg up. */}
        <a
          href="#home"
          className="group absolute left-1/2 top-1/2 shrink-0 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
        >
          <img
            src={LogoNavy}
            alt="MatchIn Logo"
            className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
              isScrolled ? "h-7" : "h-8"
            }`}
          />
        </a>

        <nav className="hidden items-center gap-6 lg:me-auto lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`${location.pathname}#${link.id}`}
              className="font-headline-sm text-[14px] font-medium text-muted transition-colors hover:text-primary"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        {/* Opposite the menu trigger on phones; back beside Apply from lg up. */}
        <LanguageButton language={lang} onChange={handleLanguageChange} />

        {/* Actions. Sign-in and the account link drop into the sheet below so
            the phone bar is two controls, not four. */}
        <div className="flex min-w-0 items-center justify-end gap-3">
          {/* TODO: point to the real sign-in / post-a-job routes */}
          <Button
            asChild
            variant="ghost"
            className="hidden font-headline-sm text-[14px] font-medium text-muted hover:bg-transparent hover:text-primary sm:inline-flex"
          >
            <Link to={localizedPath("/auth/login")}>{t("actions.apply")}</Link>
          </Button>

          {/* TODO: point to the real profile/dashboard route */}
          <Button
            asChild
            variant="outline"
            size="icon"
            className="hidden h-9 w-9 shrink-0 rounded-full border-border bg-background text-primary shadow-sm hover:bg-surface lg:inline-flex"
          >
            <Link to={localizedPath("/dashboard")}>
              <User className="h-[18px] w-[18px]" />
              <span className="sr-only">{t("navigation.profile")}</span>
            </Link>
          </Button>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={t("actions.openMenu")}
                className="h-9 w-9 shrink-0 rounded-full border-border bg-background text-primary lg:hidden"
              >
                <Menu className="h-[18px] w-[18px]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-surface">
              <nav className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.id}>
                    <a
                      href={`${location.pathname}#${link.id}`}
                      className="rounded-lg px-4 py-3 font-headline-sm text-[15px] font-medium text-ink transition-colors hover:bg-background hover:text-primary"
                    >
                      {t(link.labelKey)}
                    </a>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-2 border-t border-border p-4 pt-6">
                <SheetClose asChild>
                  <Button
                    asChild
                    variant="outline"
                    className="justify-center rounded-xl border-border py-3 text-primary"
                  >
                    {/* TODO: point to the real profile/dashboard route */}
                    <Link to={localizedPath("/dashboard")}>
                      <User className="h-[17px] w-[17px]" />
                      {t("navigation.profile")}
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    asChild
                    variant="outline"
                    className="justify-center rounded-xl border-border py-3 text-primary"
                  >
                    <Link to={localizedPath("/auth/login")}>{t("actions.signIn")}</Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    asChild
                    className="justify-center rounded-xl bg-primary py-3 text-primary-foreground hover:bg-primary/90"
                  >
                    <Link to={localizedPath("/post-a-job")}>{t("actions.postJob")}</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
