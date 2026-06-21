export type MessageRole = "user" | "assistant" | "system";

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string; // base64 data URL, kept in-memory only
  kind: "image" | "document";
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  modelId?: string;
  thinking?: string; // extended reasoning trace, if model/provider returns one
  isThinking?: boolean; // true while a response is still streaming/generating
  createdAt: number;
  error?: string;
}

export interface AIModel {
  id: string; // OpenRouter model slug, e.g. "qwen/qwen3-coder:free"
  label: string; // display name
  shortLabel: string; // for compact UI (avatars, discussion panel)
  description: string;
  supportsVision: boolean;
  supportsReasoning: boolean;
  contextWindow: number;
}

export type AppMode = "chat" | "discuss";

export interface DiscussionTurn {
  id: string;
  modelId: string;
  content: string;
  isThinking: boolean;
  createdAt: number;
}

export interface DiscussionSession {
  id: string;
  topic: string;
  participantModelIds: string[];
  turns: DiscussionTurn[];
  status: "idle" | "running" | "done" | "error";
  maxRounds: number;
  currentRound: number;
}
