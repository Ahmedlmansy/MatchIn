import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewsletterForm({ onSubscribe }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubscribe?.(email.trim());
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="mt-2 flex flex-col gap-2">
      <span className="font-headline-sm text-[13px] font-semibold text-ink">
        Subscribe to Career Intelligence
      </span>
      <form onSubmit={handleSubmit} className="flex max-w-md items-center gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSubmitted(false);
          }}
          placeholder="Enter your work email"
          className="flex-1 rounded-[10px] border-border bg-surface px-4 py-[10px] text-[13px] text-ink shadow-sm placeholder:text-muted focus-visible:border-primary focus-visible:ring-0"
        />
        <Button
          type="submit"
          className="rounded-[10px] bg-primary px-4 py-[10px] text-[13px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Join
        </Button>
      </form>
      <AnimatePresence>
        {submitted && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[12px] font-medium text-success"
          >
            You&apos;re in — check your inbox to confirm.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
