"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNeiroStore } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { MobileTabBar } from "@/components/MobileTabBar";
import { ChatPanel } from "@/components/ChatPanel";
import { DiscussionPanel } from "@/components/DiscussionPanel";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const mode = useNeiroStore((s) => s.mode);

  return (
    <div className="flex h-dvh w-full flex-col bg-void sm:flex-row">
      <Sidebar />
      <main className="flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {mode === "chat" ? <ChatPanel /> : <DiscussionPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
      <MobileTabBar />
    </div>
  );
}
