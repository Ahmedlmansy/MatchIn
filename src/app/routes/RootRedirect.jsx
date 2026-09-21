import { getLastRoute } from "@/components/shared/i18n/languageStorage";
import { Navigate } from "react-router-dom";
import { DEFAULT_LANGUAGE } from "@/utils/routes";

export default function RootRedirect() {
  const lastRoute = getLastRoute();
  const localizedLastRoute =
    lastRoute && /^\/(en|ar)(\/|$)/.test(lastRoute)
      ? lastRoute
      : lastRoute
        ? `/${DEFAULT_LANGUAGE}${lastRoute.startsWith("/") ? lastRoute : `/${lastRoute}`}`
        : `/${DEFAULT_LANGUAGE}`;

  return <Navigate to={localizedLastRoute} replace />;
}
