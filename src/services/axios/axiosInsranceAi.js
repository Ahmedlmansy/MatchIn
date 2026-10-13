import axios from "axios";
import { detectInitialLanguage } from "@/features/language/store/language.slice";

export const apiAi = axios.create({
  baseURL: import.meta.env.VITE_API_AI_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiAi.interceptors.request.use(async (config) => {
  const existingHeader =
    config.headers?.["Accept-Language"] ||
    config.headers?.["accept-language"];

  if (!existingHeader) {
    let currentLang = null;
    try {
      const { store } = await import("@/store");
      currentLang = store?.getState()?.language?.lang;
    } catch {
      // Store not ready or failed to import
    }

    if (currentLang !== "ar" && currentLang !== "en") {
      currentLang = detectInitialLanguage();
    }

    config.headers = config.headers || {};
    config.headers["Accept-Language"] = currentLang === "ar" ? "ar" : "en";
  }

  return config;
});
