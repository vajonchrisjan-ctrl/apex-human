import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { ResearchResult } from "./research";

export interface ProposalResult {
  title: string;
  body: string;
  packages: string[];
}

interface ProposalLeadInput {
  name: string;
  company: string | null;
}

const PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    packages: { type: "array", items: { type: "string" } },
  },
  required: ["title", "body", "packages"],
};

export async function draftProposal(
  agent: { name: string },
  lead: ProposalLeadInput,
  creatorContext: string,
  creatorName: string,
  researchBrief?: ResearchResult | null
): Promise<ProposalResult> {
  if (!isGeminiConfigured()) return fallbackProposal(lead);

  const system = `You ARE ${
    creatorName || "the creator"
  }, writing a scoped, priced partnership proposal for a brand. ${PITCH_GUARDRAILS}\n\nGround the scope and pricing entirely in your own Media Kit below — there is no separate rate card, so use your rate floor as the pricing anchor and scale packages up from there reasonably.\n\nAbout you:\n${creatorContext}\n\nWrite a titled proposal, a 150-250 word body pitching the partnership, and 2-4 named deliverable packages that fit your own platforms (each a short string like "Single Instagram Reel — $750" including a dollar estimate). End the body with a soft next step, like suggesting a quick call.`;

  const turns = [
    {
      role: "user" as const,
      text: `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}${
        researchBrief
          ? `\n\nWhat I know about them:\n${researchBrief.summary}\nPriorities: ${researchBrief.priorities.join(
              "; "
            )}\nBest angle: ${researchBrief.angle}`
          : ""
      }`,
    },
  ];

  try {
    const result = await geminiJSON<ProposalResult>(system, turns, PROPOSAL_SCHEMA, {
      maxTokens: 700,
      temperature: 0.6,
    });
    return normalize(result, lead);
  } catch {
    return fallbackProposal(lead);
  }
}

function normalize(result: Partial<ProposalResult>, lead: ProposalLeadInput): ProposalResult {
  return {
    title: result.title?.trim() || `Partnership proposal for ${lead.name}`,
    body: result.body?.trim() || fallbackProposal(lead).body,
    packages: (result.packages ?? []).filter(Boolean).slice(0, 4),
  };
}

function fallbackProposal(lead: ProposalLeadInput): ProposalResult {
  return {
    title: `Partnership proposal for ${lead.name}`,
    body: `Thanks for considering a partnership! I'd love to put together a package that fits your goals — once my AI key is connected I can generate real, priced options grounded in my rates and audience. For now, feel free to reach out and we can scope this together.`,
    packages: [],
  };
}
