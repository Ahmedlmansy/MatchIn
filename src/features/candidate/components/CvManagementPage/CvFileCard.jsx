import { useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const ease = [0.16, 1, 0.3, 1];

/**
 * Current CV file info + upload trigger.
 *
 * @param {{
 *   fileName: string,
 *   uploadedAt: string,
 *   size: string,
 *   onFileSelect: (file: File) => void,
 *   isUploading?: boolean,
 *   uploadProgress?: number,
 *   onCancel?: () => void,
 * }} props
 */
export default function CvFileCard({
  fileName,
  uploadedAt,
  size,
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  onCancel,
}) {
  const { t } = useTranslation("dashboard");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onFileSelect(file);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08, ease }}
      className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 md:flex-row"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <motion.h4
            key={fileName}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease }}
            className="text-sm font-bold text-ink"
          >
            {fileName || t("pages.cvManagement.noFileUploaded", "No CV uploaded yet")}
          </motion.h4>
          <p className="text-xs text-muted">
            {uploadedAt
              ? `${t("pages.cvManagement.uploaded", "Uploaded")}: ${uploadedAt} • ${t("pages.cvManagement.size", "Size")}: ${size}`
              : t("pages.cvManagement.supportedFormats", "Supported formats: PDF, DOCX (Max 5MB)")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={isUploading}
          onChange={handleChange}
        />
        {isUploading && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-xl border-border px-3 py-2 text-xs font-bold text-muted hover:text-error"
          >
            <X className="h-3.5 w-3.5" />
            {t("pages.cvManagement.cancel", "Cancel")}
          </Button>
        )}
        <Button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress > 0
                ? `${t("pages.cvManagement.uploading", "Uploading...")} (${uploadProgress}%)`
                : t("pages.cvManagement.uploading", "Uploading...")}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {fileName
                ? t("pages.cvManagement.uploadNew", "Upload New CV")
                : t("pages.cvManagement.uploadCv", "Upload CV")}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
