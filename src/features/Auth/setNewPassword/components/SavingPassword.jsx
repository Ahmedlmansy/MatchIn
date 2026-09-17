import { Loader2 } from "lucide-react";
import ResetStateView from "./ResetStateView";

export default function SavingPassword() {
  return (
    <ResetStateView
      tone="blue"
      icon={<Loader2 className="h-7 w-7 animate-spin" />}
      title="Saving New Password..."
      desc="Please wait while we securely update your password."
    />
  );
}
