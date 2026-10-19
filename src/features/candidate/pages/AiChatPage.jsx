import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Briefcase, BarChart3, CheckCircle2, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import {
  useConversationsQuery,
  useConversationQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
} from "@/features/candidate/hooks/useAiChatQuery";

import ChatHeader from "../components/AiChatPage/ChatHeader";
import MissingContextBanner from "../components/AiChatPage/MissingContextBanner";
import ChatMessageList from "../components/AiChatPage/ChatMessageList";
import SuggestedPrompts from "../components/AiChatPage/SuggestedPrompts";
import ChatInput from "../components/AiChatPage/ChatInput";

/* Backend sources only carry `type` + `url`; the UI needs an icon + href. */
const SOURCE_ICONS = {
  job: Briefcase,
  skill: BarChart3,
  task: CheckCircle2,
  phase: Map,
  roadmap: Map,
};

const withSourceIcons = (message) => ({
  ...message,
  sources: (message.sources ?? []).map((source) => ({
    ...source,
    icon: source.icon ?? SOURCE_ICONS[source.type] ?? Briefcase,
    href: source.href ?? source.url ?? "#",
  })),
});

const tempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Main AI Chat panel — talks to the real /api/mentor/* backend only.
 *
 * @param {{ showMissingContext?: boolean, className?: string }} props
 */
export default function AiChat({ showMissingContext = false, className }) {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(
    conversationId ?? null,
  );

  // Prevents the server-load effect from wiping optimistic messages mid-request
  const sendingRef = useRef(false);
  // Last text we tried to send (for Retry — avoids duplicating the user bubble)
  const lastTextRef = useRef("");
  // Auto-select the latest conversation only once, and never after "New chat"
  const autoSelectedRef = useRef(Boolean(conversationId));

  const { data: conversations, isLoading: conversationsLoading } =
    useConversationsQuery();

  const { data: conversation } = useConversationQuery(activeConversationId, {
    enabled: !!activeConversationId,
  });

  const createConversationMutation = useCreateConversationMutation();

  const sendMessageMutation = useSendMessageMutation({
    onSuccess: (data) => {
      if (data) {
        const reply = withSourceIcons(data);
        setMessages((prev) => [...prev, reply]);
      }
      sendingRef.current = false;
      setIsTyping(false);
    },
    onError: () => {
      sendingRef.current = false;
      setHasError(true);
      setIsTyping(false);
    },
  });

  // Open the most recent conversation when the page loads without an id in the URL
  useEffect(() => {
    if (autoSelectedRef.current || conversationsLoading) return;
    if (Array.isArray(conversations) && conversations.length > 0) {
      autoSelectedRef.current = true;
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, conversationsLoading]);

  // Load history from the server for the active conversation
  useEffect(() => {
    if (sendingRef.current) return;
    if (conversation?.messages) {
      setMessages(conversation.messages.map(withSourceIcons));
    }
  }, [conversation]);

  const sendToServer = useCallback(
    async (text, existingConversationId) => {
      sendingRef.current = true;
      setIsTyping(true);
      setHasError(false);
      lastTextRef.current = text;

      try {
        let convId = existingConversationId;

        // Create the conversation lazily on the first message
        if (!convId) {
          const created = await createConversationMutation.mutateAsync({
            title: text.slice(0, 60),
          });
          convId = created?.id ?? created?.data?.id;
          if (!convId) throw new Error("Conversation was not created");
          autoSelectedRef.current = true;
          setActiveConversationId(convId);
        }

        sendMessageMutation.mutate({
          conversationId: convId,
          content: text,
          message: text,
        });
      } catch {
        sendingRef.current = false;
        setHasError(true);
        setIsTyping(false);
      }
    },
    [createConversationMutation, sendMessageMutation],
  );

  const handleSend = useCallback(
    (text) => {
      const trimmed = text?.trim();
      if (!trimmed || isTyping) return;

      setMessages((prev) => [
        ...prev,
        { id: tempId(), role: "user", content: trimmed, sources: [] },
      ]);
      setInputValue("");
      sendToServer(trimmed, activeConversationId);
    },
    [isTyping, activeConversationId, sendToServer],
  );

  const handleRetry = useCallback(() => {
    if (!lastTextRef.current || isTyping) return;
    // The user message is already in the list — just resend it
    sendToServer(lastTextRef.current, activeConversationId);
  }, [isTyping, activeConversationId, sendToServer]);

  const handlePromptSelect = useCallback(
    (prompt) => handleSend(prompt),
    [handleSend],
  );

  const handleNewConversation = useCallback(() => {
    autoSelectedRef.current = true; // don't jump back to the previous chat
    sendingRef.current = false;
    setActiveConversationId(null);
    setMessages([]);
    setHasError(false);
    setIsTyping(false);
  }, []);

  const showPrompts = messages.length === 0 && !isTyping;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.05 }}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        "rounded-2xl border border-border bg-surface",
        "shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <ChatHeader
        onNewConversation={handleNewConversation}
        conversations={conversations}
        activeConversationId={activeConversationId}
      />

      <MissingContextBanner visible={showMissingContext} />

      <ChatMessageList
        messages={messages}
        isTyping={isTyping}
        hasError={hasError}
        onRetry={handleRetry}
      />

      <SuggestedPrompts visible={showPrompts} onSelect={handlePromptSelect} />

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isTyping}
      />
    </motion.section>
  );
}
