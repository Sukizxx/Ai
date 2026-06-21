/**
 * Reads an OpenRouter SSE stream and invokes onDelta for each text chunk.
 * Returns once the stream closes (on `[DONE]` or natural EOF).
 */
export async function consumeOpenRouterStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;
        if (!payload) continue;

        try {
          const json = JSON.parse(payload);
          const delta: string | undefined = json?.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        } catch {
          // Skip malformed SSE chunks (e.g. comment/keepalive lines)
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Splits raw assistant text into { thinking, answer } based on
 * <thinking>...</thinking> tags. Handles the case where the closing
 * tag hasn't arrived yet (still streaming).
 */
export function splitThinking(raw: string): { thinking: string; answer: string } {
  const openTag = "<thinking>";
  const closeTag = "</thinking>";
  const openIdx = raw.indexOf(openTag);
  if (openIdx === -1) return { thinking: "", answer: raw };

  const closeIdx = raw.indexOf(closeTag, openIdx);
  if (closeIdx === -1) {
    return {
      thinking: raw.slice(openIdx + openTag.length),
      answer: "",
    };
  }
  return {
    thinking: raw.slice(openIdx + openTag.length, closeIdx).trim(),
    answer: (raw.slice(0, openIdx) + raw.slice(closeIdx + closeTag.length)).trim(),
  };
}

export interface ExtractedCodeBlock {
  language: string;
  code: string;
}

/**
 * Extracts fenced code blocks from markdown text.
 */
export function extractCodeBlocks(markdown: string): ExtractedCodeBlock[] {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: ExtractedCodeBlock[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({
      language: (match[1] ?? "").toLowerCase(),
      code: match[2],
    });
  }
  return blocks;
}

/**
 * Finds the best candidate HTML block to render in the live preview pane.
 * Prefers a full document (has <html>), falls back to the largest
 * html/svg block, returns null if nothing previewable is present.
 */
export function findPreviewableHtml(markdown: string): string | null {
  const blocks = extractCodeBlocks(markdown).filter((b) =>
    ["html", "htm"].includes(b.language)
  );
  if (blocks.length === 0) return null;

  const fullDoc = blocks.find((b) => /<html[\s>]/i.test(b.code));
  if (fullDoc) return fullDoc.code;

  return blocks.sort((a, b) => b.code.length - a.code.length)[0].code;
}
