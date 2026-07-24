import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";

export interface ResearchResult {
  summary: string;
  priorities: string[];
  hooks: string[];
  angle: string;
}

interface ResearchLeadInput {
  name: string;
  company: string | null;
  platform: string | null;
  email: string | null;
}

const RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    priorities: { type: "array", items: { type: "string" } },
    hooks: { type: "array", items: { type: "string" } },
    angle: { type: "string" },
  },
  required: ["summary", "priorities", "hooks", "angle"],
};

export async function draftResearch(
  agent: { name: string },
  lead: ResearchLeadInput,
  creatorContext: string,
  creatorName: string
): Promise<ResearchResult> {
  if (!isGeminiConfigured()) return fallbackResearch(lead);

  const system = `You are ${agent.name}, an internal research assistant working for ${
    creatorName || "a content creator"
  }.${
    creatorContext ? `\n\nAbout the creator:\n${creatorContext}` : ""
  }\n\nYour job is to research the brand described by the user and write a short, useful internal brief the creator can use to personalize an outreach pitch. Be concrete and specific — avoid generic filler. Only state facts you're reasonably confident about; where you're inferring from the brand's likely industry, phrase it as a reasonable guess rather than a confirmed fact. This brief is for internal use only, never shown to the brand.`;

  const turns = [
    {
      role: "user" as const,
      text: `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}${
        lead.platform ? `\nFound via: ${lead.platform}` : ""
      }${lead.email ? `\nContact email: ${lead.email}` : ""}\n\nWrite the brief.`,
    },
  ];

  try {
    const result = await geminiJSON<ResearchResult>(system, turns, RESEARCH_SCHEMA, {
      maxTokens: 700,
      temperature: 0.6,
    });
    return normalize(result, lead);
  } catch {
    return fallbackResearch(lead);
  }
}

function normalize(result: Partial<ResearchResult>, lead: ResearchLeadInput): ResearchResult {
  return {
    summary: result.summary?.trim() || `A quick look at ${lead.name}.`,
    priorities: (result.priorities ?? []).filter(Boolean).slice(0, 5),
    hooks: (result.hooks ?? []).filter(Boolean).slice(0, 5),
    angle:
      result.angle?.trim() ||
      "Lead with genuine enthusiasm for the brand and your shared audience fit.",
  };
}

function fallbackResearch(lead: ResearchLeadInput): ResearchResult {
  return {
    summary: `${lead.name} is a brand you're considering pitching${
      lead.company ? ` (${lead.company})` : ""
    }. Connect your AI key for a real, brand-specific brief.`,
    priorities: [
      "Reaching an engaged, relevant audience",
      "Working with creators who feel authentic to their brand",
    ],
    hooks: [
      "Your audience overlap with their target customer",
      "Your track record with past brand partners",
    ],
    angle:
      "Open with a specific, genuine reason you like the brand, then connect it to what your audience cares about.",
  };
}
