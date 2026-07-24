import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { ResearchResult } from "./research";

export interface OutreachResult {
  score: number;
  stage: "new" | "pitched" | "negotiating" | "replied" | "booked";
  subject: string;
  body: string;
  rationale: string;
}

interface OutreachLeadInput {
  name: string;
  company: string | null;
  email: string | null;
  platform: string | null;
}

const OUTREACH_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    stage: {
      type: "string",
      enum: ["new", "pitched", "negotiating", "replied", "booked"],
    },
    subject: { type: "string" },
    body: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["score", "stage", "subject", "body", "rationale"],
};

export async function draftOutreach(
  agent: { name: string },
  lead: OutreachLeadInput,
  creatorContext: string,
  creatorName: string,
  researchBrief?: ResearchResult | null
): Promise<OutreachResult> {
  if (!isGeminiConfigured()) return fallbackOutreach(lead, creatorName);

  const hasEmail = Boolean(lead.email);
  const system = `You ARE ${
    creatorName || "the creator"
  } — a real content creator writing your OWN first-touch outreach to a brand. Write in first person: I / my / me.\n\nAbout you:\n${creatorContext}\n\n${PITCH_GUARDRAILS}\n\nIf the brand has an email, write a polished 90-140 word partnership email with a clear subject line. If it only has a social profile, write a short 2-4 sentence DM instead and leave the subject empty. Score the brand's fit for you from 0-100, and choose which pipeline stage this should move to next (normally "pitched").`;

  const turns = [
    {
      role: "user" as const,
      text: `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}
${hasEmail ? "Has an email on file — write an EMAIL." : "No email on file — write a short DM instead."}
${lead.platform ? `Platform: ${lead.platform}` : ""}${
        researchBrief
          ? `\n\nWhat I know about them:\n${researchBrief.summary}\nWhat they care about: ${researchBrief.priorities.join(
              "; "
            )}\nHooks: ${researchBrief.hooks.join("; ")}\nBest angle: ${researchBrief.angle}`
          : ""
      }`,
    },
  ];

  try {
    const result = await geminiJSON<OutreachResult>(system, turns, OUTREACH_SCHEMA, {
      maxTokens: 500,
      temperature: 0.7,
    });
    return normalize(result, lead);
  } catch {
    return fallbackOutreach(lead, creatorName);
  }
}

function normalize(result: Partial<OutreachResult>, lead: OutreachLeadInput): OutreachResult {
  const hasEmail = Boolean(lead.email);
  return {
    score: typeof result.score === "number" ? result.score : 55,
    stage: result.stage ?? "pitched",
    subject: hasEmail ? result.subject?.trim() || `Partnership idea` : "",
    body: result.body?.trim() || fallbackOutreach(lead, "").body,
    rationale: result.rationale?.trim() || "",
  };
}

function fallbackOutreach(lead: OutreachLeadInput, creatorName: string): OutreachResult {
  const hasEmail = Boolean(lead.email);
  const name = creatorName || "me";
  return {
    score: 58,
    stage: "pitched",
    subject: hasEmail ? `Partnership idea from ${name}` : "",
    body: hasEmail
      ? `Hi ${lead.name} team,\n\nI'm ${name} and I've been a fan of what you're building. I think there's a genuine fit between my audience and your brand, and I'd love to explore a partnership.\n\nWould you be open to a quick chat?\n\nBest,\n${name}`
      : `Hey! I'm ${name} and I love what ${lead.name} is doing — think there could be a great fit with my audience. Open to chatting about a partnership?`,
    rationale: "Fallback pitch (Gemini not configured).",
  };
}
