import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import ActionBanner from "@/components/shared/ActionBanner";
import Status from "@/components/shared/Status";
import CvExtractionReview from "../components/CvManagementPage/CvExtractionReview";
import CvFileCard from "../components/CvManagementPage/CvFileCard";

import { useCvHistoryQuery } from "../hooks/useCvHistoryQuery";
import {
  useCvStatusQuery,
  isCvStatusInProgress,
  IN_PROGRESS_STATUSES,
} from "../hooks/useCvStatusQuery";
import {
  useUploadCvMutation,
  getUploadErrorMessage,
} from "../hooks/useUploadCvMutation";
import { useRetryCvMutation } from "../hooks/useRetryCvMutation";
import { useVerifyCvExtractionMutation } from "../hooks/useVerifyCvExtractionMutation";
import {
  getLatestCompletedExtraction,
  extractParsedDataFromExtraction,
  buildVerifyPayload,
} from "../shared/cvMappers";

const ease = [0.16, 1, 0.3, 1];

export default function CvManagementPage() {
  const { t } = useTranslation("dashboard");
  const [banner, setBanner] = useState({ status: null, text: "" });
  const [activeDocId, setActiveDocId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractionData, setExtractionData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const abortControllerRef = useRef(null);
  const isUploadingRef = useRef(false);

  const showBanner = (status, text) => setBanner({ status, text });

  // 1. History query
  const {
    data: historyList = [],
    isLoading: _isHistoryLoading,
    isError: _isHistoryError,
    error: _historyError,
    refetch: refetchHistory,
  } = useCvHistoryQuery();

  // 2. Resume active doc tracking on reload / mount
  useEffect(() => {
    if (activeDocId) return;
    if (!Array.isArray(historyList) || historyList.length === 0) return;

    // First check if any document is in progress (especially is_current)
    const inProgressDoc = historyList.find(
      (doc) =>
        (doc.is_current || historyList.length === 1) &&
        IN_PROGRESS_STATUSES.includes((doc.status ?? "").toLowerCase())
    );

    if (inProgressDoc) {
      setActiveDocId(inProgressDoc.id);
      return;
    }

    // Otherwise pick the current or newest document
    const currentDoc = historyList.find((doc) => doc.is_current) ?? historyList[0];
    if (currentDoc) {
      setActiveDocId(currentDoc.id);
    }
  }, [historyList, activeDocId]);

  // 3. Status query for active doc
  const {
    data: cvStatus,
    isLoading: _isStatusLoading,
    isError: _isStatusError,
    error: _statusError,
    refetch: refetchStatus,
    isTakingLonger,
    isUnknownStatus,
    resetPollingTimer,
  } = useCvStatusQuery(activeDocId);

  // 4. Upload mutation
  const uploadMutation = useUploadCvMutation({
    onSuccess: (res) => {
      const newDocId =
        res?.data?.id ??
        res?.id ??
        res?.data?.document_id ??
        res?.cv_document_id;
      if (newDocId) {
        setActiveDocId(newDocId);
      }
      setIsVerified(false);
      showBanner(
        "success",
        t(
          "pages.cvManagement.uploadSuccess",
          "CV uploaded successfully! AI extraction in progress."
        )
      );
    },
    onError: (err) => {
      const msg = getUploadErrorMessage(err, t);
      if (msg) showBanner("error", msg);
    },
  });

  const handleFileSelect = (file) => {
    if (isUploadingRef.current || uploadMutation.isPending) return;
    isUploadingRef.current = true;
    setSelectedFile(file);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setUploadProgress(0);

    uploadMutation.mutate(
      {
        file,
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      },
      {
        onSettled: () => {
          isUploadingRef.current = false;
        },
      }
    );
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      isUploadingRef.current = false;
      uploadMutation.reset();
      setUploadProgress(0);
    }
  };

  // 5. Retry mutation
  const retryMutation = useRetryCvMutation({
    onSuccess: () => {
      resetPollingTimer();
      refetchStatus();
      refetchHistory();
      showBanner(
        "loading",
        t("pages.cvManagement.retryingText", "Retrying extraction...")
      );
    },
    onError: (err) => {
      showBanner(
        "error",
        err?.message ??
          t("pages.cvManagement.retryFailed", "Failed to retry extraction.")
      );
    },
  });

  const handleRetry = () => {
    if (!activeDocId || retryMutation.isPending) return;
    retryMutation.mutate(activeDocId);
  };

  const handleCheckAgain = () => {
    resetPollingTimer();
    refetchStatus();
  };

  // 6. Extraction review & Verify
  const latestCompleted = getLatestCompletedExtraction(cvStatus);

  useEffect(() => {
    if (latestCompleted) {
      const parsed = extractParsedDataFromExtraction(latestCompleted);
      setExtractionData(parsed);
    } else {
      setExtractionData(null);
    }
  }, [latestCompleted]);

  const verifyMutation = useVerifyCvExtractionMutation({
    onSuccess: () => {
      setIsVerified(true);
      refetchStatus();
      refetchHistory();
      showBanner(
        "success",
        t(
          "pages.cvManagement.verifySuccess",
          "CV extraction verified and merged into your profile successfully!"
        )
      );
    },
    onError: (err) => {
      showBanner(
        "error",
        err?.message ??
          t(
            "pages.cvManagement.verifyFailed",
            "Failed to verify extraction. Please retry."
          )
      );
    },
  });

  const handleVerify = () => {
    if (!latestCompleted?.id || verifyMutation.isPending || isVerified) return;
    const payload = buildVerifyPayload(extractionData);
    verifyMutation.mutate({
      extractionId: latestCompleted.id,
      cvDocumentId: activeDocId,
      payload,
    });
  };

  // Local item confirmation in review UI
  const confirmSkill = (id) => {
    setExtractionData((prev) => {
      if (!prev) return prev;
      const skills = prev.skills ?? prev.candidate_skills ?? [];
      const updated = skills.map((s) =>
        s.skill_id === id || s.id === id ? { ...s, confirmed: true } : s
      );
      return { ...prev, skills: updated, candidate_skills: updated };
    });
  };

  const confirmExperience = (id) => {
    setExtractionData((prev) => {
      if (!prev) return prev;
      const exps = prev.experiences ?? [];
      const updated = exps.map((e, idx) =>
        e.id === id || idx === id ? { ...e, confirmed: true } : e
      );
      return { ...prev, experiences: updated };
    });
  };

  const confirmEducation = (id) => {
    setExtractionData((prev) => {
      if (!prev) return prev;
      const edus = prev.educations ?? [];
      const updated = edus.map((ed, idx) =>
        ed.id === id || idx === id ? { ...ed, confirmed: true } : ed
      );
      return { ...prev, educations: updated };
    });
  };

  const confirmLanguage = (id) => {
    setExtractionData((prev) => {
      if (!prev) return prev;
      const langs = prev.languages ?? [];
      const updated = langs.map((l, idx) =>
        l.id === id || idx === id ? { ...l, confirmed: true } : l
      );
      return { ...prev, languages: updated };
    });
  };

  const confirmProfile = () => {
    setExtractionData((prev) => (prev ? { ...prev, profileConfirmed: true } : prev));
  };

  const confirmAll = () => {
    setExtractionData((prev) => {
      if (!prev) return prev;
      const skills = prev.skills ?? prev.candidate_skills ?? [];
      const exps = prev.experiences ?? [];
      const edus = prev.educations ?? [];
      const langs = prev.languages ?? [];

      return {
        ...prev,
        profileConfirmed: true,
        skills: skills.map((s) => ({ ...s, confirmed: true })),
        candidate_skills: skills.map((s) => ({ ...s, confirmed: true })),
        experiences: exps.map((e) => ({ ...e, confirmed: true })),
        educations: edus.map((ed) => ({ ...ed, confirmed: true })),
        languages: langs.map((l) => ({ ...l, confirmed: true })),
      };
    });
    handleVerify();
  };

  // Derive current file details
  const activeDocument =
    historyList.find((d) => d.id === activeDocId) ??
    cvStatus ??
    null;

  const fileName =
    activeDocument?.original_filename ??
    selectedFile?.name ??
    "";
  const uploadedAt =
    activeDocument?.created_at
      ? new Date(activeDocument.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
  const fileSizeStr = activeDocument?.file_size
    ? `${(activeDocument.file_size / (1024 * 1024)).toFixed(1)} MB`
    : selectedFile?.size
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : "";

  const isProcessing = isCvStatusInProgress(cvStatus);
  const isFailed =
    cvStatus?.status?.toLowerCase() === "failed" ||
    cvStatus?.status?.toLowerCase() === "error";

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-6 px-4 py-8 md:px-8">
      <div id="action-banner-slot">
        <ActionBanner status={banner.status} text={banner.text} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {t("pages.cvManagement.title", "CV Management & AI Extraction")}
            </h1>
            <p className="text-xs text-muted">
              {t(
                "pages.cvManagement.description",
                "Upload your resume, review, and verify all AI-extracted information."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isProcessing && (
              <Badge className="flex items-center gap-1.5 rounded-full border-0 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/10">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("pages.cvManagement.statusProcessing", "Processing CV…")}
              </Badge>
            )}

            {isFailed && (
              <Badge className="flex items-center gap-1.5 rounded-full border-0 bg-error/10 px-3.5 py-1.5 text-xs font-bold text-error hover:bg-error/10">
                <AlertCircle className="h-4 w-4" />
                {t("pages.cvManagement.statusFailed", "Extraction Failed")}
              </Badge>
            )}

            {latestCompleted && !isProcessing && (
              <Badge className="flex items-center gap-1.5 rounded-full border-0 bg-success/10 px-3.5 py-1.5 text-xs font-bold text-success hover:bg-success/10">
                <CheckCircle2 className="h-4 w-4" />
                {isVerified
                  ? t("pages.cvManagement.statusVerified", "Verified & Synced")
                  : t("pages.cvManagement.statusComplete", "Extraction Complete")}
              </Badge>
            )}
          </div>
        </div>

        {/* Upload File Card */}
        <CvFileCard
          fileName={fileName}
          uploadedAt={uploadedAt}
          size={fileSizeStr}
          onFileSelect={handleFileSelect}
          isUploading={uploadMutation.isPending}
          uploadProgress={uploadProgress}
          onCancel={handleCancelUpload}
        />

        {/* State Handlers */}
        {isTakingLonger && isProcessing && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <Status
              icon={<Clock className="h-6 w-6" />}
              iconClassName="bg-amber-100 text-amber-600"
              title={t(
                "pages.cvManagement.takingLongerTitle",
                "Processing is taking longer than usual"
              )}
              subtitle={t(
                "pages.cvManagement.takingLongerSubtitle",
                "Your CV is still being analyzed. You can check again now or return to this page later."
              )}
              primaryButton={{
                label: t("pages.cvManagement.checkAgain", "Check Again"),
                onClick: handleCheckAgain,
              }}
            />
          </div>
        )}

        {isFailed && (
          <div className="rounded-2xl border border-error/20 bg-error/5 p-4">
            <Status
              icon={<AlertCircle className="h-6 w-6" />}
              iconClassName="bg-error/10 text-error"
              title={t("pages.cvManagement.failedTitle", "Extraction Failed")}
              subtitle={t(
                "pages.cvManagement.failedSubtitle",
                "We were unable to process this CV document. Please retry or upload a new file."
              )}
              primaryButton={{
                label: retryMutation.isPending
                  ? t("pages.cvManagement.retrying", "Retrying...")
                  : t("pages.cvManagement.retry", "Retry Extraction"),
                onClick: handleRetry,
                disabled: retryMutation.isPending,
              }}
            />
          </div>
        )}

        {isUnknownStatus && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Status
              icon={<AlertCircle className="h-6 w-6" />}
              iconClassName="bg-muted/20 text-muted"
              title={t("pages.cvManagement.unknownStatusTitle", "Unrecognized Status")}
              subtitle={t(
                "pages.cvManagement.unknownStatusSubtitle",
                "The server returned an unrecognized document status. You can retry or check again."
              )}
              primaryButton={{
                label: t("pages.cvManagement.retry", "Retry Extraction"),
                onClick: handleRetry,
                disabled: retryMutation.isPending,
              }}
            />
          </div>
        )}

        {/* Review & Verify Step */}
        {!isFailed && !isUnknownStatus && (
          <CvExtractionReview
            extractionData={extractionData}
            onConfirmSkill={confirmSkill}
            onConfirmExperience={confirmExperience}
            onConfirmEducation={confirmEducation}
            onConfirmLanguage={confirmLanguage}
            onConfirmProfile={confirmProfile}
            onConfirmAll={confirmAll}
            onVerify={handleVerify}
            isVerifying={verifyMutation.isPending}
            isVerified={isVerified}
          />
        )}

        {/* CV Version History */}
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("pages.cvManagement.historyTitle", "CV Version History")}
            </h3>
            <span className="text-xs text-muted">
              {historyList.length} {t("pages.cvManagement.versions", "versions recorded")}
            </span>
          </div>

          {historyList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <Status
                icon={<FileText className="h-5 w-5" />}
                iconClassName="bg-muted/10 text-muted"
                title={t("pages.cvManagement.noHistoryTitle", "No CV Documents Found")}
                subtitle={t(
                  "pages.cvManagement.noHistorySubtitle",
                  "Upload your resume above to start building your career profile."
                )}
              />
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
              {historyList.map((doc) => {
                const isCurrentActive = doc.id === activeDocId;
                return (
                  <div
                    key={doc.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition-colors ${
                      isCurrentActive ? "bg-primary/5" : "hover:bg-background/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">
                            {doc.original_filename}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            v{doc.version}
                          </Badge>
                          {doc.is_current && (
                            <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2 py-0">
                              {t("pages.cvManagement.current", "Current")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted">
                          {doc.created_at
                            ? new Date(doc.created_at).toLocaleDateString()
                            : ""}
                          {doc.file_size
                            ? ` • ${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {doc.status}
                      </Badge>

                      {!isCurrentActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveDocId(doc.id)}
                          className="h-8 text-xs font-semibold rounded-lg"
                        >
                          {t("pages.cvManagement.viewDocument", "View")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
