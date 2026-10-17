import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import ListEditor from "./ListEditor";
import { I18nField, PlainField } from "./CmsFields";

export default function SectionBody({
  sectionKey,
  data,
  viewLang,
  onPatch,
  langs,
  isI18n,
  tx,
  clone,
  sectionInfo,
  ease,
}) {
  const { t } = useTranslation("dashboard");
  const set = (path, value) => {
    const parts = path.split(".");
    if (parts.length === 1) {
      onPatch({ [parts[0]]: value });
      return;
    }
    const [parent, child] = parts;
    onPatch({ [parent]: { ...(data[parent] || {}), [child]: value } });
  };
  const fieldProps = { viewLang, langs, isI18n };
  const listProps = { clone, tx, ease };

  if (sectionKey === "sections")
    return (
      <div className="space-y-4">
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.browserTabTitle`)}
          value={data.meta?.title}
          onChange={(value) =>
            onPatch({ meta: { ...data.meta, title: value } })
          }
        />
        <PlainField
          label={t(`pages.admin.cmsEditor.fields.philosophyImage`)}
          value={data.media?.philosophyImage}
          onChange={(value) =>
            onPatch({ media: { ...data.media, philosophyImage: value } })
          }
        />
        <PlainField
          label={t(`pages.admin.cmsEditor.fields.whyImage`)}
          value={data.media?.whyImage}
          onChange={(value) =>
            onPatch({ media: { ...data.media, whyImage: value } })
          }
        />
        <LayoutTable
          sections={data.sections}
          onChange={(sections) => onPatch({ sections })}
          sectionInfo={sectionInfo}
        />
      </div>
    );

  if (sectionKey === "navbar")
    return (
      <div className="grid grid-cols-2 gap-3">
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.brandName`)}
          value={data.brand}
          onChange={(value) => set("brand", value)}
        />
        <PlainField
          label={t(`pages.admin.cmsEditor.fields.logoUrl`)}
          value={data.logoUrl}
          onChange={(value) => set("logoUrl", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.signInLabel`)}
          value={data.signIn?.label}
          onChange={(value) => set("signIn.label", value)}
        />
        <PlainField
          label={t(`pages.admin.cmsEditor.fields.signInUrl`)}
          value={data.signIn?.href}
          onChange={(value) => set("signIn.href", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.buttonLabel`)}
          value={data.cta?.label}
          onChange={(value) => set("cta.label", value)}
        />
        <PlainField
          label={t(`pages.admin.cmsEditor.fields.buttonUrl`)}
          value={data.cta?.href}
          onChange={(value) => set("cta.href", value)}
        />
        <ListEditor
          {...listProps}
          title={t(`pages.admin.cmsEditor.fields.navLinks`)}
          items={data.links || []}
          titleKey="label"
          blankItem={{ label: { en: "", ar: "" }, href: "#", visible: true }}
          onChange={(links) => onPatch({ links })}
          renderFields={(item, patch) => (
            <>
              <I18nField
                {...fieldProps}
                label={t(`pages.admin.cmsEditor.fields.label`)}
                value={item.label}
                onChange={(value) => patch({ label: value })}
              />
              <PlainField
                label={t(`pages.admin.cmsEditor.fields.linkUrl`)}
                value={item.href}
                onChange={(value) => patch({ href: value })}
              />
            </>
          )}
        />
      </div>
    );

  if (sectionKey === "hero")
    return (
      <div className="grid grid-cols-2 gap-3">
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.badge`)}
          value={data.badge}
          onChange={(value) => set("badge", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.headline`)}
          value={data.headlinePre}
          onChange={(value) => set("headlinePre", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.highlightedWord`)}
          value={data.headlineHighlight}
          onChange={(value) => set("headlineHighlight", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.subtitle`)}
          value={data.subtitle}
          multiline
          onChange={(value) => set("subtitle", value)}
        />
        <PlainField
          label={t(`pages.admin.cmsEditor.fields.backgroundImage`)}
          value={data.backgroundImage}
          onChange={(value) => set("backgroundImage", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.searchPlaceholder`)}
          value={data.searchPlaceholder}
          onChange={(value) => set("searchPlaceholder", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.defaultLocation`)}
          value={data.locationDefault}
          onChange={(value) => set("locationDefault", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.searchButtonLabel`)}
          value={data.searchButton}
          onChange={(value) => set("searchButton", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.popularLabel`)}
          value={data.popularLabel}
          onChange={(value) => set("popularLabel", value)}
        />
        <I18nField
          {...fieldProps}
          label={t(`pages.admin.cmsEditor.fields.scrollCue`)}
          value={data.scrollCue}
          onChange={(value) => set("scrollCue", value)}
        />
        <ListEditor
          {...listProps}
          title={t(`pages.admin.cmsEditor.fields.popularChips`)}
          items={data.popular || []}
          titleKey="label"
          blankItem={{ label: { en: "", ar: "" }, visible: true }}
          onChange={(popular) => onPatch({ popular })}
          renderFields={(item, patch) => (
            <I18nField
              {...fieldProps}
              label={t(`pages.admin.cmsEditor.fields.label`)}
              value={item.label}
              onChange={(value) => patch({ label: value })}
            />
          )}
        />
      </div>
    );

  if (sectionKey === "stats")
    return (
      <ListEditor
        {...listProps}
        title={t(`pages.admin.cmsEditor.fields.counters`)}
        items={data.items || []}
        titleKey="label"
        blankItem={{
          value: 0,
          suffix: "",
          label: { en: "", ar: "" },
          decimals: 0,
          visible: true,
        }}
        onChange={(items) => onPatch({ items })}
        renderFields={(item, patch) => (
          <>
            <PlainField
              label={t(`pages.admin.cmsEditor.fields.number`)}
              type="number"
              value={item.value}
              onChange={(value) => patch({ value })}
            />
            <PlainField
              label={t(`pages.admin.cmsEditor.fields.suffix`)}
              value={item.suffix}
              onChange={(value) => patch({ suffix: value })}
            />
            <I18nField
              {...fieldProps}
              label={t(`pages.admin.cmsEditor.fields.label`)}
              value={item.label}
              onChange={(value) => patch({ label: value })}
            />
            <PlainField
              label={t(`pages.admin.cmsEditor.fields.decimals`)}
              type="number"
              value={item.decimals}
              onChange={(value) => patch({ decimals: value })}
            />
          </>
        )}
      />
    );

  return (
    <GenericSectionEditor
      data={data}
      viewLang={viewLang}
      onPatch={onPatch}
      sectionKey={sectionKey}
      langs={langs}
      isI18n={isI18n}
      tx={tx}
      clone={clone}
      sectionInfo={sectionInfo}
      ease={ease}
    />
  );
}

function GenericSectionEditor({
  data,
  viewLang,
  onPatch,
  sectionKey,
  langs,
  isI18n,
  tx,
  clone,
  ease,
}) {
  const { t } = useTranslation("dashboard");
  const textKeys = Object.keys(data || {}).filter(
    (key) => isI18n(data[key]) || typeof data[key] === "string",
  );
  const listKeys = Object.keys(data || {}).filter((key) =>
    Array.isArray(data[key]),
  );
  const fieldProps = { viewLang, langs, isI18n };
  const fieldLabel = (key) => {
    const translated = t(`pages.admin.cmsEditor.fields.${key}`, {
      defaultValue: "",
    });
    return (
      translated ||
      t("pages.admin.cmsEditor.fields.customField", { field: key })
    );
  };
  const sectionLabel = t(`pages.admin.cmsEditor.sections.${sectionKey}.label`, {
    defaultValue: sectionKey,
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {textKeys.map((key) =>
        isI18n(data[key]) ? (
          <I18nField
            key={key}
            {...fieldProps}
            label={fieldLabel(key)}
            value={data[key]}
            multiline={String(tx(data[key])).length > 80}
            onChange={(value) => onPatch({ [key]: value })}
          />
        ) : (
          <PlainField
            key={key}
            label={fieldLabel(key)}
            value={data[key]}
            onChange={(value) => onPatch({ [key]: value })}
          />
        ),
      )}
      {listKeys.map((key) => (
        <ListEditor
          key={key}
          title={fieldLabel(key)}
          items={data[key] || []}
          titleKey={getTitleKey(data[key], isI18n)}
          blankItem={
            data[key]?.[0]
              ? { ...clone(data[key][0]), visible: true }
              : { label: { en: "", ar: "" }, visible: true }
          }
          onChange={(items) => onPatch({ [key]: items })}
          clone={clone}
          tx={tx}
          ease={ease}
          renderFields={(item, patch) =>
            Object.keys(item)
              .filter((fieldKey) => fieldKey !== "visible")
              .map((fieldKey) =>
                isI18n(item[fieldKey]) ? (
                  <I18nField
                    key={fieldKey}
                    {...fieldProps}
                    label={fieldLabel(fieldKey)}
                    value={item[fieldKey]}
                    onChange={(value) => patch({ [fieldKey]: value })}
                  />
                ) : typeof item[fieldKey] === "string" ||
                  typeof item[fieldKey] === "number" ? (
                  <PlainField
                    key={fieldKey}
                    label={fieldLabel(fieldKey)}
                    type={
                      typeof item[fieldKey] === "number" ? "number" : "text"
                    }
                    value={item[fieldKey]}
                    onChange={(value) => patch({ [fieldKey]: value })}
                  />
                ) : null,
              )
          }
        />
      ))}
      {textKeys.length === 0 && listKeys.length === 0 && (
        <p className="col-span-2 text-sm text-muted">
          {t("pages.admin.cmsEditor.fields.noFields", {
            section: sectionLabel,
          })}
        </p>
      )}
    </div>
  );
}

function getTitleKey(items, isI18n) {
  const first = items?.[0];
  if (first && isI18n(first.title)) return "title";
  if (first && isI18n(first.label)) return "label";
  if (first && isI18n(first.name)) return "name";
  if (first && isI18n(first.text)) return "text";
  return "title";
}

function LayoutTable({ sections, onChange, sectionInfo }) {
  const { t } = useTranslation("dashboard");
  const L = "pages.admin.cmsEditor.layout";
  const rows = Object.entries(sections || {}).sort(
    (a, b) => a[1].order - b[1].order,
  );
  return (
    <div className="mb-2">
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
        {t(`${L}.title`)}
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase text-muted">
            <th className="pb-1">{t(`${L}.section`)}</th>
            <th>{t(`${L}.show`)}</th>
            <th>{t(`${L}.order`)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, section]) => (
            <tr key={key} className="border-t border-border">
              <td className="py-2 pr-6 text-ink">
                {sectionInfo[key]?.label || key}
              </td>
              <td className="pr-6">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary"
                  checked={!!section.visible}
                  onChange={(event) =>
                    onChange({
                      ...sections,
                      [key]: { ...section, visible: event.target.checked },
                    })
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={section.order}
                  onChange={(event) =>
                    onChange({
                      ...sections,
                      [key]: { ...section, order: +event.target.value || 0 },
                    })
                  }
                  className="h-8 w-20 text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
