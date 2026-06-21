"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Eye, Copy, Check, ExternalLink } from "lucide-react";
import { extractCodeBlocks } from "@/lib/stream";

const EASE = [0.16, 1, 0.3, 1] as const;

interface CodePreviewProps {
  markdown: string;
}

export function CodePreview({ markdown }: CodePreviewProps) {
  const blocks = useMemo(() => extractCodeBlocks(markdown), [markdown]);
  const htmlBlocks = useMemo(
    () => blocks.filter((b) => ["html", "htm"].includes(b.language)),
    [blocks]
  );
  const previewSource = useMemo(() => {
    if (htmlBlocks.length === 0) return null;
    const fullDoc = htmlBlocks.find((b) => /<html[\s>]/i.test(b.code));
    return fullDoc ? fullDoc.code : htmlBlocks.sort((a, b) => b.code.length - a.code.length)[0].code;
  }, [htmlBlocks]);

  const [tab, setTab] = useState<"code" | "preview">(previewSource ? "preview" : "code");
  const [copied, setCopied] = useState(false);

  if (blocks.length === 0) return null;

  function handleCopy() {
    const text = previewSource ?? blocks.map((b) => b.code).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleOpenNewTab() {
    if (!previewSource) return;
    const blob = new Blob([previewSource], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="mt-3 overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border-soft bg-surface-raised px-2 py-1.5">
        <div className="flex items-center gap-1">
          {previewSource && (
            <TabButton active={tab === "preview"} onClick={() => setTab("preview")} icon={<Eye size={13} />}>
              Preview
            </TabButton>
          )}
          <TabButton active={tab === "code"} onClick={() => setTab("code")} icon={<Code2 size={13} />}>
            Code
          </TabButton>
        </div>
        <div className="flex items-center gap-1">
          {previewSource && tab === "preview" && (
            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-text"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-text"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <Check size={13} /> Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <Copy size={13} /> Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "preview" && previewSource ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="h-[420px] bg-white"
          >
            <iframe
              srcDoc={previewSource}
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-pointer-lock"
              className="h-full w-full border-0"
              title="Live preview"
            />
          </motion.div>
        ) : (
          <motion.div
            key="code"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="max-h-[420px] overflow-auto"
          >
            {blocks.map((b, i) => (
              <pre
                key={i}
                className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-text"
              >
                <code>{b.code}</code>
              </pre>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active ? "text-text-bright" : "text-muted hover:text-text"
      }`}
    >
      {active && (
        <motion.div
          layoutId="codepreview-tab-bg"
          className="absolute inset-0 rounded-md bg-white/[0.06]"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {icon}
        {children}
      </span>
    </button>
  );
}
