import "server-only";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export interface Turn {
  role: "user" | "model";
  text: string;
}

interface GenOpts {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

async function callGemini(
  system: string,
  turns: Turn[],
  opts: GenOpts & { responseSchema?: unknown } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  try {
    const res = await fetch(
      `${API_BASE}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({
            role: t.role,
            parts: [{ text: t.text }],
          })),
          generationConfig: {
            temperature: opts.temperature ?? 0.6,
            maxOutputTokens: opts.maxTokens ?? 800,
            thinkingConfig: { thinkingLevel: "low" },
            ...(opts.responseSchema
              ? {
                  responseMimeType: "application/json",
                  responseSchema: opts.responseSchema,
                }
              : {}),
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini request failed (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("") ?? "";
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function geminiGenerate(
  system: string,
  turns: Turn[],
  opts: GenOpts = {}
): Promise<string> {
  return callGemini(system, turns, opts);
}

export async function geminiJSON<T>(
  system: string,
  turns: Turn[],
  schema: unknown,
  opts: GenOpts = {}
): Promise<T> {
  const text = await callGemini(system, turns, { ...opts, responseSchema: schema });
  return JSON.parse(text) as T;
}
