"use client";

import { motion } from "framer-motion";
import { FileText, AlertTriangle } from "lucide-react";
import { ChatMessage } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ThinkingTrace } from "./ThinkingTrace";
import { CodePreview } from "./CodePreview";
import { formatFileSize } from "@/lib/files";
import { getModelById } from "@/lib/models";

const EASE = [0.16, 1, 0.3, 1] as const;

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const model = message.modelId ? getModelById(message.modelId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[88%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {!isUser && model && (
          <span className="mb-1 px-1 text-[11px] font-medium text-muted-dim">{model.shortLabel}</span>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {message.attachments.map((a) =>
              a.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not optimizable
                <img
                  key={a.id}
                  src={a.dataUrl}
                  alt={a.name}
                  className="h-20 w-20 rounded-lg border border-border object-cover"
                />
              ) : (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted"
                >
                  <FileText size={13} />
                  <span className="max-w-[140px] truncate">{a.name}</span>
                  <span className="text-muted-dim">{formatFileSize(a.size)}</span>
                </div>
              )
            )}
          </div>
        )}

        {!isUser && (message.thinking || message.isThinking) && (
          <ThinkingTrace thinking={message.thinking ?? ""} isActive={!!message.isThinking && !message.content} />
        )}

        {message.content && (
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? "rounded-br-md bg-text-bright text-void"
                : "rounded-bl-md border border-border bg-surface text-text"
            }`}
          >
            <MarkdownRenderer content={message.content} />
          </div>
        )}

        {!isUser && message.content && <CodePreview markdown={message.content} />}

        {message.error && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
            <AlertTriangle size={13} className="shrink-0 text-text" />
            <span>{message.error}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
