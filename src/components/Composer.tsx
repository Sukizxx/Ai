"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, ArrowUp, X, FileText, Brain, Globe, Square } from "lucide-react";
import { useNeiroStore } from "@/lib/store";
import { processFiles, formatFileSize } from "@/lib/files";

const EASE = [0.16, 1, 0.3, 1] as const;

interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ onSend, onStop }: ComposerProps) {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pendingAttachments = useNeiroStore((s) => s.pendingAttachments);
  const addPendingAttachments = useNeiroStore((s) => s.addPendingAttachments);
  const removePendingAttachment = useNeiroStore((s) => s.removePendingAttachment);
  const thinkingMode = useNeiroStore((s) => s.thinkingMode);
  const toggleThinkingMode = useNeiroStore((s) => s.toggleThinkingMode);
  const searchMode = useNeiroStore((s) => s.searchMode);
  const toggleSearchMode = useNeiroStore((s) => s.toggleSearchMode);
  const isGenerating = useNeiroStore((s) => s.isGenerating);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setFileError(null);
    const { attachments, errors } = await processFiles(files);
    if (attachments.length > 0) addPendingAttachments(attachments);
    if (errors.length > 0) setFileError(errors[0]);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && pendingAttachments.length === 0) return;
    if (isGenerating) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-border bg-void px-3 pb-3 pt-2 sm:px-6 sm:pb-5">
      <AnimatePresence>
        {pendingAttachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mb-2 flex flex-wrap gap-2 overflow-hidden"
          >
            {pendingAttachments.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface py-1 pl-2 pr-1 text-xs text-text"
              >
                {a.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not optimizable
                  <img src={a.dataUrl} alt={a.name} className="h-6 w-6 rounded object-cover" />
                ) : (
                  <FileText size={13} className="text-muted" />
                )}
                <span className="max-w-[100px] truncate">{a.name}</span>
                <span className="text-muted-dim">{formatFileSize(a.size)}</span>
                <button
                  onClick={() => removePendingAttachment(a.id)}
                  className="ml-0.5 rounded-full p-0.5 text-muted hover:bg-white/10 hover:text-text"
                  aria-label={`Remove ${a.name}`}
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {fileError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-1.5 px-1 text-xs text-muted"
        >
          {fileError}
        </motion.p>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface px-2 py-2 transition-colors focus-within:border-muted-dim">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,text/plain,text/markdown,text/csv,application/json,application/pdf"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-text"
          aria-label="Attach file"
        >
          <Paperclip size={17} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tanya apa saja…"
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-text placeholder:text-muted-dim focus:outline-none"
        />

        <div className="flex shrink-0 items-center gap-1">
          <ToggleIcon active={thinkingMode} onClick={toggleThinkingMode} icon={<Brain size={15} />} label="Thinking mode" />
          <ToggleIcon active={searchMode} onClick={toggleSearchMode} icon={<Globe size={15} />} label="Search mode" />

          {isGenerating ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onStop}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-text-bright text-void transition-transform active:scale-90"
              aria-label="Stop generating"
            >
              <Square size={13} fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!text.trim() && pendingAttachments.length === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-text-bright text-void transition-opacity disabled:opacity-25"
              aria-label="Send message"
            >
              <ArrowUp size={17} strokeWidth={2.5} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleIcon({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
        active ? "text-text-bright" : "text-muted hover:text-text"
      }`}
    >
      {active && (
        <motion.div
          layoutId={`toggle-bg-${label}`}
          className="absolute inset-0 rounded-xl bg-white/[0.08]"
          transition={{ duration: 0.2, ease: EASE }}
        />
      )}
      <span className="relative">{icon}</span>
    </button>
  );
}
