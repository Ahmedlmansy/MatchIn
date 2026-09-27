import React from 'react'
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation("common");
  return (
    <div>
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.description")}</p>
    </div>
  )
}
