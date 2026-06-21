import { create } from "zustand";
import { nanoid } from "nanoid";
import { ChatMessage, Attachment, AppMode, DiscussionSession } from "@/types";
import { DEFAULT_MODEL_ID } from "@/lib/models";

interface NeiroState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  messages: ChatMessage[];
  selectedModelId: string;
  thinkingMode: boolean;
  searchMode: boolean;
  pendingAttachments: Attachment[];
  isGenerating: boolean;

  setSelectedModelId: (id: string) => void;
  toggleThinkingMode: () => void;
  toggleSearchMode: () => void;
  addPendingAttachments: (a: Attachment[]) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;

  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  setIsGenerating: (v: boolean) => void;
  clearChat: () => void;

  discussion: DiscussionSession | null;
  setDiscussion: (d: DiscussionSession | null) => void;
  updateDiscussion: (patch: Partial<DiscussionSession>) => void;
}

export const useNeiroStore = create<NeiroState>((set) => ({
  mode: "chat",
  setMode: (mode) => set({ mode }),

  messages: [],
  selectedModelId: DEFAULT_MODEL_ID,
  thinkingMode: false,
  searchMode: false,
  pendingAttachments: [],
  isGenerating: false,

  setSelectedModelId: (id) => set({ selectedModelId: id }),
  toggleThinkingMode: () => set((s) => ({ thinkingMode: !s.thinkingMode })),
  toggleSearchMode: () => set((s) => ({ searchMode: !s.searchMode })),
  addPendingAttachments: (a) =>
    set((s) => ({ pendingAttachments: [...s.pendingAttachments, ...a] })),
  removePendingAttachment: (id) =>
    set((s) => ({
      pendingAttachments: s.pendingAttachments.filter((x) => x.id !== id),
    })),
  clearPendingAttachments: () => set({ pendingAttachments: [] }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  setIsGenerating: (v) => set({ isGenerating: v }),
  clearChat: () => set({ messages: [], pendingAttachments: [] }),

  discussion: null,
  setDiscussion: (d) => set({ discussion: d }),
  updateDiscussion: (patch) =>
    set((s) => ({
      discussion: s.discussion ? { ...s.discussion, ...patch } : s.discussion,
    })),
}));

export function createMessageId(): string {
  return nanoid(10);
}
