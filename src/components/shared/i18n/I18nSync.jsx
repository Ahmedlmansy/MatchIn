import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage, selectCurrentLanguage } from "@/features/language/store/language.slice";
import i18n from "./index";

const SUPPORTED_LANGUAGES = ["en", "ar"];

export default function I18nSync() {
  const { lang } = useParams();
  const dispatch = useDispatch();
  const currentLang = useSelector(selectCurrentLanguage);

  useEffect(() => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;

    if (lang !== currentLang) {
      dispatch(setLanguage(lang));
    }

    i18n.changeLanguage(lang);

    document.documentElement.lang = lang;

    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, currentLang, dispatch]);

  return null;
}
