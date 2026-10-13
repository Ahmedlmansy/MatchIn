import { createSlice } from "@reduxjs/toolkit";
import { getLastRoute } from "@/components/shared/i18n/languageStorage";

export function normalizeLanguage(lang) {
  if (typeof lang !== "string") return "en";
  const lower = lang.toLowerCase().trim();
  if (lower === "ar" || lower.startsWith("ar-") || lower.startsWith("ar_")) {
    return "ar";
  }
  return "en";
}

export function detectInitialLanguage() {
  if (typeof window !== "undefined" && window.location?.pathname) {
    const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
    if (firstSegment === "en" || firstSegment === "ar") {
      return firstSegment;
    }
  }

  const stored = getLastRoute();
  if (stored === "en" || stored === "ar") {
    return stored;
  }

  return "en";
}

const initialState = {
  lang: detectInitialLanguage(),
};

export const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.lang = normalizeLanguage(action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export const selectCurrentLanguage = (state) => state.language.lang;

export default languageSlice.reducer;
