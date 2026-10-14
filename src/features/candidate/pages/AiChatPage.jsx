import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, BarChart3, CheckCircle2, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useConversationsQuery, useConversationQuery, useCreateConversationMutation, useSendMessageMutation } from "@/features/candidate/hooks/useAiChatQuery";

import ChatHeader from "../components/AiChatPage/ChatHeader";
import MissingContextBanner from "../components/AiChatPage/MissingContextBanner";
import ChatMessageList from "../components/AiChatPage/ChatMessageList";
import SuggestedPrompts from "../components/AiChatPage/SuggestedPrompts";
import ChatInput from "../components/AiChatPage/ChatInput";

/* ─── Demo data (fallback when no backend) ─── */
const createDemoMessages = (t) => [
  {
    id: 1,
    role: "user",
    content: t("ui.chat.demoQuestion"),
  },
  {
    id: 2,
    role: "assistant",
    content: t("ui.chat.demoAnswer"),
    sources: [
      {
        icon: Briefcase,
        label: t("ui.chat.sourceJob"),
        href: "#",
      },
      { icon: BarChart3, label: t("ui.chat.sourceSkillGap"), href: "#" },
    ],
  },
  {
    id: 3,
    role: "user",
    content: t("ui.chat.demoQuestionWeek"),
  },
  {
    id: 4,
    role: "assistant",
    content: t("ui.chat.demoAnswerWeek"),
    sources: [
      {
        icon: CheckCircle2,
        label: t("ui.chat.sourceTask"),
        href: "#",
      },
      { icon: Map, label: t("ui.chat.sourcePhase"), href: "#" },
    ],
  },
];

let nextId = 100;

/**
 * Main AI Chat panel.
 * Uses real backend API when available, falls back to demo mode.
 *
 * @param {{
 *   showMissingContext?: boolean,
 *   className?: string,
 * }} props
 */
export default function AiChat({ showMissingContext = false, className }) {
  const { t, i18n } = useTranslation("common");
  const { conversationId } = useParams();
  const [messages, setMessages] = useState(() => createDemoMessages(t));
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId ?? null);

  // Fetch conversations list
  const { data: conversations, isLoading: conversationsLoading } = useConversationsQuery();
  
  // Fetch active conversation
  const { data: conversation, isLoading: _conversationLoading, refetch: _refetchConversation } = useConversationQuery(activeConversationId, {
    enabled: !!activeConversationId && !isDemoMode,
  });

  // Mutations
  const createConversationMutation = useCreateConversationMutation({
    onSuccess: (data) => {
      if (data?.id) {
        setActiveConversationId(data.id);
        setIsDemoMode(false);
      }
    },
    onError: () => {
      setIsDemoMode(true);
    },
  });

  const sendMessageMutation = useSendMessageMutation({
    onSuccess: (data) => {
      // AI response is already added optimistically, just update with real data
      if (data) {
        setMessages((prev) => {
          // Replace the last assistant message (optimistic) with real one
          const lastIdx = prev.findLastIndex((m) => m.role === "assistant");
          if (lastIdx >= 0) {
            const updated = [...prev];
            updated[lastIdx] = data;
            return updated;
          }
          return [...prev, data];
        });
      }
      setIsTyping(false);
    },
    onError: () => {
      setHasError(true);
      setIsTyping(false);
    },
  });

  // Load conversation messages when conversation changes
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
      setIsDemoMode(false);
    }
  }, [conversation]);

  // Handle language change for demo messages
  useEffect(() => {
    if (isDemoMode) {
      const refreshDemoMessages = () => {
        setMessages((previous) => [
          ...createDemoMessages(i18n.t.bind(i18n)),
          ...previous.filter((message) => message.id >= 100),
        ]);
      };
      i18n.on("languageChanged", refreshDemoMessages);
      return () => i18n.off("languageChanged", refreshDemoMessages);
    }
  }, [i18n, isDemoMode]);

  // Initialize: if no conversationId in URL, try to use first conversation or create new
  useEffect(() => {
    if (!activeConversationId && conversations?.length > 0 && !conversationsLoading) {
      setActiveConversationId(conversations[0].id);
    } else if (!activeConversationId && !conversationsLoading && conversations?.length === 0) {
      // Create a new conversation
      createConversationMutation.mutate({ title: "New Conversation" });
    }
  }, [conversations, conversationsLoading, activeConversationId, createConversationMutation]);

  const handleSend = useCallback(
    (text) => {
      if (!text.trim()) return;

      // Add user message optimistically
      const userMsg = { id: nextId++, role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);
      setHasError(false);

      if (isDemoMode || !activeConversationId) {
        // Demo mode - simulate AI response
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: nextId++,
              role: "assistant",
              content: t("ui.chat.responsePrefix", { question: text }),
              sources: [
                {
                  icon: Briefcase,
                  label: t("ui.chat.relatedJob"),
                  href: "#",
                },
              ],
            },
          ]);
        }, 2000);
      } else {
        // Real API mode
        sendMessageMutation.mutate({ conversationId: activeConversationId, content: text });
      }
    },
    [t, isDemoMode, activeConversationId, sendMessageMutation],
  );

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsTyping(true);
    
    // Get the last user message to retry
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    
    if (isDemoMode || !activeConversationId || !lastUserMsg) {
      // Demo mode retry
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId++,
            role: "assistant",
            content: t("ui.chat.retryResponse"),
          },
        ]);
      }, 1500);
    } else {
      // Real API retry
      sendMessageMutation.mutate({ conversationId: activeConversationId, content: lastUserMsg.content });
    }
  }, [t, isDemoMode, activeConversationId, messages, sendMessageMutation]);

  const handlePromptSelect = useCallback(
    (prompt) => {
      handleSend(prompt);
    },
    [handleSend],
  );

  const handleNewConversation = useCallback(() => {
    createConversationMutation.mutate({ title: "New Conversation" });
    setMessages([]);
    setIsDemoMode(false);
  }, [createConversationMutation]);

  const showPrompts = messages.length === 0 && !isTyping;

  // Determine if we should show missing context banner
  const showMissingContextBanner = showMissingContext && isDemoMode;

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
      <ChatHeader onNewConversation={handleNewConversation} conversations={conversations} activeConversationId={activeConversationId} />
      
      <MissingContextBanner visible={showMissingContextBanner} />

      <ChatMessageList
        messages={messages}
        isTyping={isTyping}
        hasError={hasError}
        onRetry={handleRetry}
      />

      <SuggestedPrompts
        visible={showPrompts || (messages.length <= 2 && !isTyping)}
        onSelect={handlePromptSelect}
      />

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isTyping}
      />
    </motion.section>
  );
}