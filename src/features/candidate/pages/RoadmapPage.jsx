import { useState } from "react";
import { 
  EmptyProfileState, 
  NoRoadmapState, 
  GeneratingState, 
  ErrorState 
} from "../components/RoadmapPage/RoadmapStates";
import RoadmapBoard from "../components/RoadmapPage/RoadmapBoard";
import { useRoadmapQuery, useGenerateRoadmapMutation, useRefreshRoadmapMutation, useGenerationStatusQuery } from "@/features/candidate/hooks/useRoadmapQuery";
import { useProfileQuery } from "@/features/candidate/hooks/useProfileQuery";
import { useCvHistoryQuery } from "@/features/candidate/hooks/useCvHistoryQuery";

export default function RoadmapPage() {
  const [view, setView] = useState("loading"); // loading, empty-profile, no-roadmap, generating, error, generated
  const [generationId, setGenerationId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check profile and CV status
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const { data: cvHistory, isLoading: cvLoading } = useCvHistoryQuery();
  const hasProfile = profile?.profile_exists && profile?.jobTitle;
  const hasCV = cvHistory?.some((cv) => cv.is_current && cv.status === "completed");

  // Fetch existing roadmap
  const { data: roadmap, isLoading: roadmapLoading, isError: roadmapError, refetch } = useRoadmapQuery();

  // Mutations
  const generateMutation = useGenerateRoadmapMutation({
    onSuccess: (data) => {
      if (data?.generationId) {
        setGenerationId(data.generationId);
        setView("generating");
      } else if (data?.roadmap) {
        setView("generated");
      }
    },
    onError: () => {
      setView("error");
    },
  });

  const refreshMutation = useRefreshRoadmapMutation({
    onMutate: () => setIsUpdating(true),
    onSettled: () => {
      setIsUpdating(false);
      setView("generated");
    },
  });

  // Poll generation status
  const { data: generationStatus } = useGenerationStatusQuery(generationId, {
    enabled: view === "generating" && !!generationId,
  });

  // Handle generation status changes
  if (view === "generating" && generationStatus) {
    if (generationStatus.status === "completed") {
      setView("generated");
      setGenerationId(null);
    } else if (generationStatus.status === "failed") {
      setView("error");
      setGenerationId(null);
    }
  }

  // Determine initial view based on data
  // This runs after initial data loads
  if (view === "loading" && !profileLoading && !cvLoading && !roadmapLoading) {
    if (!hasProfile) {
      setView("empty-profile");
    } else if (roadmapError || !roadmap) {
      setView("no-roadmap");
    } else {
      setView("generated");
    }
  }

  const handleGenerate = (targetRole) => {
    if (!hasProfile) return;
    generateMutation.mutate({ targetRole: targetRole ?? "Senior Frontend Engineer" });
  };

  const handleRefresh = () => {
    if (roadmap?.targetRole) {
      refreshMutation.mutate(roadmap.targetRole);
    }
  };

  const handleRetry = () => {
    setView("loading");
    refetch();
  };

  const handleChangeRole = () => {
    setView("no-roadmap");
  };

  return (
    <main className="mx-auto max-w-[960px] px-5 py-8">
      {view === "loading" && (
        <GeneratingState />
      )}
      
      {view === "empty-profile" && (
        <EmptyProfileState 
          onUploadCv={() => {}} 
          onCompleteProfile={() => {}} 
        />
      )}
      
      {view === "no-roadmap" && (
        <NoRoadmapState 
          onGenerate={handleGenerate}
          hasCV={hasCV}
          hasProfile={hasProfile}
        />
      )}
      
      {view === "generating" && (
        <GeneratingState />
      )}
      
      {view === "error" && (
        <ErrorState onRetry={handleRetry} />
      )}
      
      {view === "generated" && roadmap && (
        <RoadmapBoard 
          roadmap={roadmap}
          isUpdating={isUpdating}
          onRefresh={handleRefresh}
          onChangeRole={handleChangeRole}
        />
      )}
      
      {view === "generated" && !roadmap && (
        <ErrorState onRetry={handleRetry} />
      )}
    </main>
  );
}