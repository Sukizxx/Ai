"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Check, Square, RotateCcw } from "lucide-react";
import { useNeiroStore } from "@/lib/store";
import { AI_MODELS, getModelById } from "@/lib/models";
import { DiscussionSession, DiscussionTurn } from "@/types";
import { nanoid } from "nanoid";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { BreathingCore } from "./BreathingCore";

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_ROUNDS = 3;

export function DiscussionPanel() {
  const discussion = useNeiroStore((s) => s.discussion);
  const setDiscussion = useNeiroStore((s) => s.setDiscussion);
  const updateDiscussion = useNeiroStore((s) => s.updateDiscussion);

  const [topic, setTopic] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([
    AI_MODELS[0].id,
    AI_MODELS[1].id,
    AI_MODELS[2].id,
  ]);
  const abortRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [discussion?.turns.length]);

  function toggleModel(id: string) {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function startDiscussion() {
    if (!topic.trim() || selectedModels.length < 2) return;

    abortRef.current = { cancelled: false };
    const session: DiscussionSession = {
      id: nanoid(8),
      topic: topic.trim(),
      participantModelIds: selectedModels,
      turns: [],
      status: "running",
      maxRounds: MAX_ROUNDS,
      currentRound: 0,
    };
    setDiscussion(session);

    const participantLabels = selectedModels.map((id) => getModelById(id).shortLabel);
    let turns: DiscussionTurn[] = [];

    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        if (abortRef.current.cancelled) break;
        updateDiscussion({ currentRound: round + 1 });

        for (const modelId of selectedModels) {
          if (abortRef.current.cancelled) break;

          const placeholderId = nanoid(8);
          const placeholder: DiscussionTurn = {
            id: placeholderId,
            modelId,
            content: "",
            isThinking: true,
            createdAt: Date.now(),
          };
          turns = [...turns, placeholder];
          updateDiscussion({ turns });

          const res = await fetch("/api/discuss", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelId,
              speakerLabel: getModelById(modelId).shortLabel,
              topic: session.topic,
              participantLabels,
              priorTurns: turns
                .filter((t) => t.id !== placeholderId)
                .map((t) => ({
                  modelId: t.modelId,
                  content: t.content,
                  speakerLabel: getModelById(t.modelId).shortLabel,
                })),
            }),
          });

          const data = await res.json();
          const content: string = res.ok ? data.content : `[error: ${data.error}]`;

          turns = turns.map((t) =>
            t.id === placeholderId ? { ...t, content, isThinking: false } : t
          );
          updateDiscussion({ turns });
        }
      }
      updateDiscussion({ status: abortRef.current.cancelled ? "idle" : "done" });
    } catch {
      updateDiscussion({ status: "error" });
    }
  }

  function stopDiscussion() {
    abortRef.current.cancelled = true;
    updateDiscussion({ status: "idle" });
  }

  if (!discussion) {
    return (
      <SetupView
        topic={topic}
        setTopic={setTopic}
        selectedModels={selectedModels}
        toggleModel={toggleModel}
        onStart={startDiscussion}
      />
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-bright">{discussion.topic}</p>
          <p className="text-xs text-muted">
            Ronde {discussion.currentRound}/{discussion.maxRounds} ·{" "}
            {discussion.participantModelIds.map((id) => getModelById(id).shortLabel).join(", ")}
          </p>
        </div>
        {discussion.status === "running" ? (
          <button
            onClick={stopDiscussion}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text transition-colors hover:border-muted-dim"
          >
            <Square size={12} fill="currentColor" /> Stop
          </button>
        ) : (
          <button
            onClick={() => setDiscussion(null)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text transition-colors hover:border-muted-dim"
          >
            <RotateCcw size={12} /> Baru
          </button>
        )}
      </header>

      <div className="flex items-center justify-center border-b border-border-soft py-4">
        <BreathingCore
          size={90}
          fragmented
          active={discussion.status === "running"}
          nodeCount={discussion.participantModelIds.length}
        />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {discussion.turns.map((turn) => (
            <DiscussionTurnBubble key={turn.id} turn={turn} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscussionTurnBubble({ turn }: { turn: DiscussionTurn }) {
  const model = getModelById(turn.modelId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="rounded-xl border border-border bg-surface px-4 py-3"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised text-[10px] font-semibold text-text-bright">
          {model.shortLabel.charAt(0)}
        </span>
        <span className="text-xs font-medium text-muted">{model.shortLabel}</span>
      </div>
      {turn.isThinking ? (
        <div className="flex items-center gap-1 py-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-muted"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      ) : (
        <MarkdownRenderer content={turn.content} />
      )}
    </motion.div>
  );
}

function SetupView({
  topic,
  setTopic,
  selectedModels,
  toggleModel,
  onStart,
}: {
  topic: string;
  setTopic: (v: string) => void;
  selectedModels: string[];
  toggleModel: (id: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <BreathingCore size={90} fragmented nodeCount={selectedModels.length || 2} />
        </div>
        <h2 className="text-center font-display text-xl font-semibold text-text-bright">
          Diskusi AI
        </h2>
        <p className="mt-1 text-center text-sm text-muted">
          Beberapa model akan berdiskusi bareng tentang topik yang kamu mau.
        </p>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topik diskusi, misal: Apakah AI bakal gantiin programmer?"
          rows={3}
          className="mt-5 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-text placeholder:text-muted-dim focus:outline-none focus:border-muted-dim"
        />

        <p className="mb-2 mt-4 text-xs font-medium text-muted">Pilih minimal 2 model</p>
        <div className="flex flex-col gap-1.5">
          {AI_MODELS.map((m) => {
            const active = selectedModels.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleModel(m.id)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "border-text-bright/40 bg-white/[0.04] text-text-bright"
                    : "border-border text-muted hover:border-muted-dim"
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    active ? "border-text-bright bg-text-bright" : "border-border"
                  }`}
                >
                  {active && <Check size={11} className="text-void" />}
                </div>
                {m.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onStart}
          disabled={!topic.trim() || selectedModels.length < 2}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-text-bright py-2.5 text-sm font-medium text-void transition-opacity disabled:opacity-25"
        >
          <Send size={14} /> Mulai diskusi
        </button>
      </motion.div>
    </div>
  );
}
