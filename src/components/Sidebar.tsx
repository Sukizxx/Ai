"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Plus } from "lucide-react";
import { useNeiroStore } from "@/lib/store";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Sidebar() {
  const mode = useNeiroStore((s) => s.mode);
  const setMode = useNeiroStore((s) => s.setMode);
  const clearChat = useNeiroStore((s) => s.clearChat);
  const setDiscussion = useNeiroStore((s) => s.setDiscussion);

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-void px-3 py-4 sm:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-text-bright">
          <span className="font-display text-sm font-bold text-void">N</span>
        </div>
        <span className="font-display text-[15px] font-semibold tracking-tight text-text-bright">
          NeiroAI
        </span>
      </div>

      <button
        onClick={() => {
          if (mode === "chat") clearChat();
          else setDiscussion(null);
        }}
        className="mb-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-text transition-colors hover:border-muted-dim hover:bg-white/[0.02]"
      >
        <Plus size={15} />
        New {mode === "chat" ? "chat" : "discussion"}
      </button>

      <nav className="flex flex-col gap-1">
        <NavItem
          icon={<MessageSquare size={15} />}
          label="Chat"
          active={mode === "chat"}
          onClick={() => setMode("chat")}
        />
        <NavItem
          icon={<Users size={15} />}
          label="Diskusi AI"
          active={mode === "discuss"}
          onClick={() => setMode("discuss")}
        />
      </nav>

      <div className="mt-auto px-2 text-[11px] leading-relaxed text-muted-dim">
        Powered by multiple free OpenRouter models.
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        active ? "text-text-bright" : "text-muted hover:text-text"
      }`}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-lg bg-white/[0.06]"
          transition={{ duration: 0.25, ease: EASE }}
        />
      )}
      <span className="relative">{icon}</span>
      <span className="relative">{label}</span>
    </button>
  );
}
