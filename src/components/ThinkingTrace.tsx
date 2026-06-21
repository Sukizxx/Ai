"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface ThinkingTraceProps {
  thinking: string;
  isActive: boolean;
}

export function ThinkingTrace({ thinking, isActive }: ThinkingTraceProps) {
  const [open, setOpen] = useState(isActive);

  if (!thinking && !isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3, ease: EASE }}
      className="mb-2 overflow-hidden rounded-lg border border-border-soft bg-surface/60"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <motion.div
          animate={isActive ? { rotate: 360 } : { rotate: 0 }}
          transition={isActive ? { duration: 1.6, repeat: Infinity, ease: "linear" } : {}}
        >
          <Sparkles size={13} className="text-muted" />
        </motion.div>
        <span className="text-xs font-medium text-muted">
          {isActive ? "Thinking…" : "Thought process"}
        </span>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2, ease: EASE }} className="ml-auto">
          <ChevronRight size={13} className="text-muted-dim" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && thinking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <p className="border-t border-border-soft px-3 py-2 text-xs leading-relaxed text-muted-dim whitespace-pre-wrap">
              {thinking}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
