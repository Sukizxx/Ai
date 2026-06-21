"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Eye, Brain } from "lucide-react";
import { AI_MODELS } from "@/lib/models";
import { useNeiroStore } from "@/lib/store";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ModelPicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedModelId = useNeiroStore((s) => s.selectedModelId);
  const setSelectedModelId = useNeiroStore((s) => s.setSelectedModelId);
  const selected = AI_MODELS.find((m) => m.id === selectedModelId) ?? AI_MODELS[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-muted-dim"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium">{selected.shortLabel}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
          <ChevronDown size={14} className="text-muted" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            role="listbox"
            className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-2xl shadow-black/50"
          >
            {AI_MODELS.map((model, i) => (
              <motion.button
                key={model.id}
                role="option"
                aria-selected={model.id === selectedModelId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03, ease: EASE }}
                onClick={() => {
                  setSelectedModelId(model.id);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-3 border-b border-border-soft px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.03]"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {model.id === selectedModelId && <Check size={14} className="text-text-bright" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-bright">{model.label}</span>
                    {model.supportsVision && (
                      <Eye size={12} className="text-muted" aria-label="Supports image input" />
                    )}
                    {model.supportsReasoning && (
                      <Brain size={12} className="text-muted" aria-label="Supports reasoning" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-muted">{model.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
