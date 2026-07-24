import type { CapabilityId } from "@/lib/agentTypes";
import type { RosterAgent } from "@/lib/agents/types";

export type ChatIntentKind =
  | "discovery"
  | "research"
  | "outreach"
  | "proposal"
  | "followup"
  | "booking"
  | "unknown";

export interface ChatIntent {
  kind: ChatIntentKind;
  category?: string;
}

export const INTENT_CAPABILITY: Record<ChatIntentKind, CapabilityId | null> = {
  discovery: "scrape",
  research: "research",
  outreach: "outreach",
  proposal: "proposal",
  followup: "follow-up",
  booking: "book-meeting",
  unknown: null,
};

export function findMentionedAgent(text: string, roster: RosterAgent[]): RosterAgent | null {
  const match = text.match(/@([\w-]+)/);
  if (!match) return null;
  const mention = match[1].toLowerCase();
  return (
    roster.find(
      (a) =>
        a.name.toLowerCase().includes(mention) ||
        a.role.toLowerCase().includes(mention) ||
        a.type.toLowerCase().includes(mention)
    ) ?? null
  );
}

export function stripMention(text: string): string {
  return text.replace(/^@[\w-]+\s*/, "").trim();
}

export function parseIntent(text: string): ChatIntent {
  const lower = text.toLowerCase();

  if (/\bbook(?:ed|ing)?\b/.test(lower) || /\bschedule\b/.test(lower)) {
    return { kind: "booking" };
  }

  const discoveryMatch = lower.match(/find(?:\s+me)?(?:\s+some)?\s+(.+?)\s+brands?/);
  if (discoveryMatch || /\bdiscover\b/.test(lower)) {
    return { kind: "discovery", category: discoveryMatch?.[1]?.trim() };
  }

  if (/\bfollow[\s-]?up\b/.test(lower)) {
    return { kind: "followup" };
  }
  if (/\bproposal\b/.test(lower)) {
    return { kind: "proposal" };
  }
  if (/\bbrief\b/.test(lower) || /\bresearch\b/.test(lower)) {
    return { kind: "research" };
  }
  if (/\bpitch\b/.test(lower) || /\boutreach\b/.test(lower) || /\breach out\b/.test(lower) || /\bemail\b/.test(lower)) {
    return { kind: "outreach" };
  }

  return { kind: "unknown" };
}

export function findMentionedLead<T extends { id: string; name: string }>(
  text: string,
  leadsList: T[]
): T | null {
  const lower = text.toLowerCase();
  const exact = leadsList.find((l) => lower.includes(l.name.toLowerCase()));
  if (exact) return exact;

  return (
    leadsList.find((l) => {
      const words = l.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      return words.some((w) => {
        const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`).test(lower);
      });
    }) ?? null
  );
}
