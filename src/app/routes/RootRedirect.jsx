import { getLastRoute } from "@/components/shared/i18n/languageStorage";
import { Navigate } from "react-router-dom";

export default function RootRedirect() {
  const lastRoute = getLastRoute();

  return <Navigate to={lastRoute || "/en"} replace />;
}
