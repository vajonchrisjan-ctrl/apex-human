import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";

export interface ParsedMeetingInput {
  title: string;
  brandMention: string | null;
  whenAt: string;
  whenLabel: string;
}

const MEETING_SCHEMA = {
  type: "object",
  properties: {
    brandMention: { type: "string" },
    whenAt: { type: "string" },
    whenLabel: { type: "string" },
  },
  required: ["whenAt", "whenLabel"],
};

export async function parseMeetingText(
  text: string,
  nowIso: string
): Promise<ParsedMeetingInput> {
  if (!isGeminiConfigured()) return fallbackParse();

  const system = `You extract meeting details from a short natural-language sentence about booking a brand call. The current date/time is ${nowIso} (ISO 8601) — use it to resolve relative phrases like "next Tuesday" or "tomorrow at 2pm". Return the brand name mentioned (if any, omit if none), the meeting's date/time as a full ISO 8601 string using the same timezone offset as the current time given, and a short human-friendly label like "Tue, Jan 28 at 2:00 PM".`;

  const turns = [{ role: "user" as const, text }];

  try {
    const result = await geminiJSON<{
      brandMention?: string;
      whenAt: string;
      whenLabel: string;
    }>(system, turns, MEETING_SCHEMA, { maxTokens: 200, temperature: 0.2 });

    const parsedDate = new Date(result.whenAt);
    if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");

    return {
      title: result.brandMention ? `Call with ${result.brandMention}` : "Brand call",
      brandMention: result.brandMention?.trim() || null,
      whenAt: parsedDate.toISOString(),
      whenLabel: result.whenLabel?.trim() || parsedDate.toLocaleString(),
    };
  } catch {
    return fallbackParse();
  }
}

function fallbackParse(): ParsedMeetingInput {
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(10, 0, 0, 0);
  return {
    title: "Brand call",
    brandMention: null,
    whenAt: fallback.toISOString(),
    whenLabel: fallback.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}
