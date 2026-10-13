import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/auth.slice.js";
import languageReducer from "@/features/language/store/language.slice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
  },
});
