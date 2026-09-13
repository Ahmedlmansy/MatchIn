import { cn } from "@/lib/utils";

export default function AuthCard({ children, className }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col justify-center overflow-y-auto rounded-2xl border border-[#E5E1DA] bg-white px-9 py-7",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
