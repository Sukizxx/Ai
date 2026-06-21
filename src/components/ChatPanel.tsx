"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNeiroStore, createMessageId } from "@/lib/store";
import { ChatMessage, Attachment } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { ModelPicker } from "./ModelPicker";
import { BreathingCore } from "./BreathingCore";
import { TypingDots } from "./TypingDots";
import { consumeOpenRouterStream, splitThinking } from "@/lib/stream";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ChatPanel() {
  const messages = useNeiroStore((s) => s.messages);
  const addMessage = useNeiroStore((s) => s.addMessage);
  const updateMessage = useNeiroStore((s) => s.updateMessage);
  const selectedModelId = useNeiroStore((s) => s.selectedModelId);
  const thinkingMode = useNeiroStore((s) => s.thinkingMode);
  const searchMode = useNeiroStore((s) => s.searchMode);
  const pendingAttachments = useNeiroStore((s) => s.pendingAttachments);
  const clearPendingAttachments = useNeiroStore((s) => s.clearPendingAttachments);
  const isGenerating = useNeiroStore((s) => s.isGenerating);
  const setIsGenerating = useNeiroStore((s) => s.setIsGenerating);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    setStreamError(null);
    const attachments: Attachment[] = [...pendingAttachments];
    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
      attachments,
      createdAt: Date.now(),
    };
    addMessage(userMsg);
    clearPendingAttachments();

    const assistantId = createMessageId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      modelId: selectedModelId,
      isThinking: true,
      createdAt: Date.now(),
    };
    addMessage(assistantMsg);
    setIsGenerating(true);

    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments?.map((a) => ({
        mimeType: a.mimeType,
        dataUrl: a.dataUrl,
        name: a.name,
        kind: a.kind,
      })),
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    let raw = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModelId,
          messages: history,
          thinkingMode,
          searchMode,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => ({ error: "Unknown error." }));
        throw new Error(errJson.error || `Request failed (${res.status}).`);
      }

      await consumeOpenRouterStream(
        res.body,
        (delta) => {
          raw += delta;
          const { thinking, answer } = splitThinking(raw);
          updateMessage(assistantId, {
            content: answer,
            thinking,
            isThinking: answer.length === 0,
          });
        },
        controller.signal
      );

      const final = splitThinking(raw);
      updateMessage(assistantId, {
        content: final.answer || raw,
        thinking: final.thinking,
        isThinking: false,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateMessage(assistantId, { isThinking: false });
      } else {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setStreamError(message);
        updateMessage(assistantId, { isThinking: false, error: message });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <ModelPicker />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-6 sm:px-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isGenerating && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <TypingDots />
              </div>
            )}
          </div>
        )}
      </div>

      {streamError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted sm:mx-6"
        >
          {streamError}
        </motion.div>
      )}

      <div className="mx-auto w-full max-w-3xl">
        <Composer onSend={handleSend} onStop={handleStop} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex h-full flex-col items-center justify-center gap-6 text-center"
    >
      <BreathingCore size={110} />
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-bright">
          NeiroAI
        </h1>
        <p className="mt-1.5 max-w-xs text-sm text-muted">
          Tanya apa saja, kirim file, atau minta kode dengan live preview.
        </p>
      </div>
    </motion.div>
  );
}
