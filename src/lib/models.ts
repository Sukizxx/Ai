import { AIModel } from "@/types";

/**
 * Curated free-tier OpenRouter models (verified June 2026).
 * All IDs end in ":free" — zero cost, subject to OpenRouter's free-tier
 * rate limits (typically ~20 req/min, daily cap varies by account).
 * Free model availability can change without notice upstream; if a model
 * 404s, swap the slug here.
 */
export const AI_MODELS: AIModel[] = [
  {
    id: "qwen/qwen3-coder:free",
    label: "Qwen3 Coder",
    shortLabel: "Qwen3",
    description: "Strongest free coding model — 1M context, agentic tool use.",
    supportsVision: false,
    supportsReasoning: false,
    contextWindow: 1_000_000,
  },
  {
    id: "deepseek/deepseek-r1:free",
    label: "DeepSeek R1",
    shortLabel: "DeepSeek",
    description: "Top free reasoning model with native chain-of-thought.",
    supportsVision: false,
    supportsReasoning: true,
    contextWindow: 128_000,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B",
    shortLabel: "Llama 3.3",
    description: "Balanced general-purpose model from Meta.",
    supportsVision: false,
    supportsReasoning: false,
    contextWindow: 128_000,
  },
  {
    id: "google/gemma-3-12b-it:free",
    label: "Gemma 3 12B",
    shortLabel: "Gemma 3",
    description: "Fast, lightweight general-purpose model from Google.",
    supportsVision: false,
    supportsReasoning: false,
    contextWindow: 128_000,
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    label: "Nemotron Nano VL",
    shortLabel: "Nemotron",
    description: "Vision-capable model — best pick for image attachments.",
    supportsVision: true,
    supportsReasoning: true,
    contextWindow: 128_000,
  },
];

export const DEFAULT_MODEL_ID = AI_MODELS[0].id;

export function getModelById(id: string): AIModel {
  const found = AI_MODELS.find((m) => m.id === id);
  if (!found) {
    throw new Error(`Unknown model id: ${id}`);
  }
  return found;
}

export function getVisionCapableModel(): AIModel {
  return AI_MODELS.find((m) => m.supportsVision) ?? AI_MODELS[0];
}
