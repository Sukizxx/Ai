import { NextRequest } from "next/server";
import { BASE_SYSTEM_PROMPT, buildThinkingInstruction } from "@/lib/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

interface IncomingAttachment {
  mimeType: string;
  dataUrl: string;
  name: string;
  kind: "image" | "document";
}

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: IncomingAttachment[];
}

interface ChatRequestBody {
  modelId: string;
  messages: IncomingMessage[];
  thinkingMode: boolean;
  searchMode: boolean;
}

function isValidModelId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length < 200;
}

/**
 * Converts our internal message format (which may include image attachments)
 * into OpenRouter / OpenAI-compatible content blocks.
 */
function toOpenRouterMessages(
  messages: IncomingMessage[],
  systemPrompt: string
) {
  const out: Array<{
    role: string;
    content: string | Array<Record<string, unknown>>;
  }> = [{ role: "system", content: systemPrompt }];

  for (const msg of messages) {
    const images = (msg.attachments ?? []).filter((a) => a.kind === "image");
    const docs = (msg.attachments ?? []).filter((a) => a.kind === "document");

    let textContent = msg.content;
    if (docs.length > 0) {
      const docNote = docs
        .map((d) => `\n\n[Attached document: ${d.name}]`)
        .join("");
      textContent += docNote;
    }

    if (images.length > 0 && msg.role === "user") {
      const contentBlocks: Array<Record<string, unknown>> = [
        { type: "text", text: textContent || "Describe this image." },
      ];
      for (const img of images) {
        contentBlocks.push({
          type: "image_url",
          image_url: { url: img.dataUrl },
        });
      }
      out.push({ role: msg.role, content: contentBlocks });
    } else {
      out.push({ role: msg.role, content: textContent });
    }
  }

  return out;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "REPLACE_WITH_NEW_KEY") {
    return new Response(
      JSON.stringify({
        error:
          "OPENROUTER_API_KEY is not configured on the server. Set it in .env.local.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isValidModelId(body.modelId)) {
    return new Response(JSON.stringify({ error: "Invalid modelId." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages must be a non-empty array." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (body.messages.length > 200) {
    return new Response(JSON.stringify({ error: "Too many messages in history." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (body.thinkingMode) {
    systemPrompt += `\n\n${buildThinkingInstruction()}`;
  }

  const orMessages = toOpenRouterMessages(body.messages, systemPrompt);

  const plugins: Array<Record<string, unknown>> = [];
  if (body.searchMode) {
    plugins.push({ id: "web" });
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://neiroai.app",
        "X-Title": "NeiroAI",
      },
      body: JSON.stringify({
        model: body.modelId,
        messages: orMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
        ...(plugins.length > 0 ? { plugins } : {}),
      }),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Failed to reach OpenRouter: ${(err as Error).message}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "Unknown upstream error");
    return new Response(
      JSON.stringify({ error: `OpenRouter error (${upstream.status}): ${errText}` }),
      { status: upstream.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pass the SSE stream straight through to the client.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
