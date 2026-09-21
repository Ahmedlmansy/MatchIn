import { saveLastRoute } from "@/components/shared/i18n/languageStorage";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") return;

    saveLastRoute(location.pathname + location.search + location.hash);
  }, [location]);

  return null;
}
