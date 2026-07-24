import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";

export interface FollowupResult {
  subject: string;
  body: string;
  rationale: string;
}

interface FollowupLeadInput {
  name: string;
  company: string | null;
}

interface PriorPitch {
  subject: string | null;
  body: string;
}

const FOLLOWUP_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["subject", "body", "rationale"],
};

export async function draftFollowup(
  agent: { name: string },
  lead: FollowupLeadInput,
  priorPitch: PriorPitch,
  creatorContext: string,
  creatorName: string
): Promise<FollowupResult> {
  if (!isGeminiConfigured()) return fallbackFollowup(lead, priorPitch);

  const system = `You ARE ${
    creatorName || "the creator"
  }, writing a short, warm follow-up to a brand you already pitched who's gone quiet. ${PITCH_GUARDRAILS}\n\nAbout you:\n${creatorContext}\n\nWrite a brief, polite nudge (2-4 sentences) that builds naturally on what you said before — don't just repeat it verbatim. Keep it warm, low-pressure, and easy to say yes to.`;

  const turns = [
    {
      role: "user" as const,
      text: `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}\n\nWhat I said before:\n${
        priorPitch.subject ? `Subject: ${priorPitch.subject}\n` : ""
      }${priorPitch.body}`,
    },
  ];

  try {
    const result = await geminiJSON<FollowupResult>(system, turns, FOLLOWUP_SCHEMA, {
      maxTokens: 400,
      temperature: 0.7,
    });
    return normalize(result, priorPitch);
  } catch {
    return fallbackFollowup(lead, priorPitch);
  }
}

function normalize(result: Partial<FollowupResult>, priorPitch: PriorPitch): FollowupResult {
  return {
    subject: result.subject?.trim() || (priorPitch.subject ? `Re: ${priorPitch.subject}` : "Circling back"),
    body: result.body?.trim() || fallbackFollowup({ name: "", company: null }, priorPitch).body,
    rationale: result.rationale?.trim() || "",
  };
}

function fallbackFollowup(lead: FollowupLeadInput, priorPitch: PriorPitch): FollowupResult {
  return {
    subject: priorPitch.subject ? `Re: ${priorPitch.subject}` : "Circling back",
    body: `Hi again — just wanted to circle back on my note about a partnership${
      lead.name ? ` with ${lead.name}` : ""
    }. Would love to hear your thoughts whenever you get a chance!`,
    rationale: "Fallback follow-up (Gemini not configured).",
  };
}
