"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { useNeiroStore } from "@/lib/store";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileTabBar() {
  const mode = useNeiroStore((s) => s.mode);
  const setMode = useNeiroStore((s) => s.setMode);

  return (
    <nav className="flex items-center justify-around border-t border-border bg-void px-2 py-1.5 sm:hidden">
      <TabItem
        icon={<MessageSquare size={18} />}
        label="Chat"
        active={mode === "chat"}
        onClick={() => setMode("chat")}
      />
      <TabItem
        icon={<Users size={18} />}
        label="Diskusi"
        active={mode === "discuss"}
        onClick={() => setMode("discuss")}
      />
    </nav>
  );
}

function TabItem({
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
    <button onClick={onClick} className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5">
      {active && (
        <motion.div
          layoutId="mobile-tab-indicator"
          className="absolute top-0 h-0.5 w-8 rounded-full bg-text-bright"
          transition={{ duration: 0.25, ease: EASE }}
        />
      )}
      <span className={active ? "text-text-bright" : "text-muted"}>{icon}</span>
      <span className={`text-[10px] ${active ? "text-text-bright" : "text-muted"}`}>{label}</span>
    </button>
  );
}
