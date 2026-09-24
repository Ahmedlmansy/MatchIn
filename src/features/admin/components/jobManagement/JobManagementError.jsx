import { ErrorState } from "@/features/admin/shared";

/**
 * JobManagementError
 * Error-state view for the job list, with a retry action.
 */
export default function JobManagementError({ onRetry }) {
  return (
    <ErrorState
      title="Couldn't load jobs"
      description="Something went wrong on our end. Please try again."
      retryLabel="Retry"
      onRetry={onRetry}
    />
  );
}