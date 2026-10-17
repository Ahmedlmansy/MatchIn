import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ApplicationDetailNotes({
  notes,
  showNoteForm,
  noteText,
  setShowNoteForm,
  setNoteText,
  handleSaveNote,
}) {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("dashboard");
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-[15px]">{t("pages.applicationDetail.notes")}</h2>
        <button
          type="button"
          onClick={() => setShowNoteForm((prev) => !prev)}
          className="text-[12px] font-semibold text-primary flex items-center gap-1 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("pages.applicationDetail.addNote")}
        </button>
      </div>

      {showNoteForm && (
        <div className="mb-4 rounded-xl border border-border p-3">
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t(`pages.applicationDetail.addNotePlaceholder`)}
            className="w-full border border-border rounded-xl p-3 text-[13px] outline-none focus:border-primary resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowNoteForm(false)}
              className="h-8 px-3 rounded-full text-[12px] font-semibold text-[#44474E] hover:bg-background"
            >
              {tCommon("actions.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              className="h-8 px-4 rounded-full bg-primary text-white text-[12px] font-semibold hover:bg-[#0F2036]"
            >
                {tCommon("actions.save")}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="border border-border rounded-xl p-3.5">
            <p className="text-[13px] text-[#44474E] leading-relaxed">
              {note.text}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted">{note.date}</span>
              <button
                type="button"
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                {tCommon("actions.edit")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
