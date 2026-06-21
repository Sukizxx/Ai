import { NextRequest } from "next/server";
import { DISCUSSION_SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

interface DiscussTurnInput {
  modelId: string;
  content: string;
  speakerLabel: string;
}

interface DiscussRequestBody {
  modelId: string;
  speakerLabel: string;
  topic: string;
  participantLabels: string[];
  priorTurns: DiscussTurnInput[];
}

function isValidModelId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length < 200;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "REPLACE_WITH_NEW_KEY") {
    return new Response(
      JSON.stringify({ error: "OPENROUTER_API_KEY is not configured on the server." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: DiscussRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isValidModelId(body.modelId) || typeof body.topic !== "string" || !body.topic.trim()) {
    return new Response(JSON.stringify({ error: "Invalid modelId or topic." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!Array.isArray(body.priorTurns) || body.priorTurns.length > 100) {
    return new Response(JSON.stringify({ error: "Invalid priorTurns." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = DISCUSSION_SYSTEM_PROMPT(
    body.participantLabels ?? [],
    body.topic
  );

  const transcript = body.priorTurns
    .map((t) => `${t.speakerLabel}: ${t.content}`)
    .join("\n\n");

  const userPrompt = transcript
    ? `Discussion topic: ${body.topic}\n\nTranscript so far:\n${transcript}\n\nYour turn (speaking as ${body.speakerLabel}):`
    : `Discussion topic: ${body.topic}\n\nYou are opening the discussion (speaking as ${body.speakerLabel}). Share your initial take.`;

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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        temperature: 0.8,
        max_tokens: 600,
      }),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Failed to reach OpenRouter: ${(err as Error).message}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "Unknown upstream error");
    return new Response(
      JSON.stringify({ error: `OpenRouter error (${upstream.status}): ${errText}` }),
      { status: upstream.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await upstream.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  return new Response(JSON.stringify({ content }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
