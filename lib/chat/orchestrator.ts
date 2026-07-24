import "server-only";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, activity, outreachDrafts, proposals } from "@/lib/db/schema";
import { getCreatorProfile, profileSummary, creatorDisplayName } from "@/lib/profile/store";
import { draftResearch } from "@/lib/ai/research";
import { draftOutreach } from "@/lib/ai/outreach";
import { draftProposal } from "@/lib/ai/proposal";
import { draftFollowup } from "@/lib/ai/followup";
import { runDiscovery } from "@/lib/scrape/runDiscovery";
import { bookMeetingFromText } from "@/lib/meetings/actions";
import type { RosterAgent } from "@/lib/agents/types";
import type { ResearchResult } from "@/lib/ai/research";
import {
  parseIntent,
  stripMention,
  findMentionedLead,
  INTENT_CAPABILITY,
} from "./intent";

export async function runChatIntent(
  userId: string,
  mentionedAgent: RosterAgent,
  roster: RosterAgent[],
  rawText: string
): Promise<string> {
  const strippedText = stripMention(rawText);
  const intent = parseIntent(strippedText);
  const requiredCap = INTENT_CAPABILITY[intent.kind];

  if (!requiredCap) {
    return `Not sure what you'd like me to do — try things like "find me some fitness brands", "write a brief on [brand]", "pitch [brand]", "draft a proposal for [brand]", "follow up with [brand]", or "book a call with [brand] next Tuesday at 2pm".`;
  }

  let agent = mentionedAgent;
  let prefix = "";
  if (!mentionedAgent.capabilities.includes(requiredCap)) {
    const capable = roster.find((a) => a.capabilities.includes(requiredCap));
    if (capable) {
      agent = capable;
      prefix = `${capable.name} here — that's actually my department. `;
    }
  }

  const db = getDb()!;

  if (intent.kind === "discovery") {
    const result = await runDiscovery(userId, intent.category);
    return (
      prefix +
      (result.added > 0
        ? `Found ${result.added} new brand${result.added === 1 ? "" : "s"} in "${result.niche}" — check Pending review in Deals.`
        : `Didn't find any new brands in "${result.niche}" this time — try again in a bit, or try a different category.`)
    );
  }

  if (intent.kind === "booking") {
    const result = await bookMeetingFromText(strippedText, null);
    return result?.ok
      ? `${prefix}Booked: ${result.title} — ${result.whenLabel}. Check your Calendar.`
      : `${prefix}Couldn't book that — try rephrasing, e.g. "book a call with Acme next Tuesday at 2pm".`;
  }

  const allLeads = await db.select().from(leads).where(eq(leads.userId, userId));
  const lead = findMentionedLead(strippedText, allLeads);
  if (!lead) {
    return (
      prefix +
      `I couldn't tell which brand you meant — try mentioning its exact name from your Deals list.`
    );
  }

  const [profile, creatorName] = await Promise.all([getCreatorProfile(userId), creatorDisplayName()]);
  const creatorContext = profileSummary(profile);
  const research = (lead.research as ResearchResult | null) ?? undefined;

  if (intent.kind === "research") {
    const brief = await draftResearch(
      { name: agent.name },
      { name: lead.name, company: lead.company, platform: lead.platform, email: lead.email },
      creatorContext,
      creatorName
    );
    await db.update(leads).set({ research: brief, updatedAt: new Date() }).where(eq(leads.id, lead.id));
    await db.insert(activity).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      type: "lead_researched",
      text: `Wrote a brand brief for ${lead.name}`,
    });
    return `${prefix}Here's the brief on ${lead.name}:\n\n${brief.summary}\n\nBest angle: ${brief.angle}`;
  }

  if (intent.kind === "outreach") {
    const draft = await draftOutreach(
      { name: agent.name },
      { name: lead.name, company: lead.company, email: lead.email, platform: lead.platform },
      creatorContext,
      creatorName,
      research
    );
    await db.insert(outreachDrafts).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      subject: draft.subject || null,
      body: draft.body,
      rationale: draft.rationale,
      status: "draft",
    });
    await db
      .update(leads)
      .set({ status: draft.stage, score: draft.score, updatedAt: new Date() })
      .where(eq(leads.id, lead.id));
    await db.insert(activity).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      type: "email_drafted",
      text: `Drafted a pitch for ${lead.name}`,
    });
    return `${prefix}Drafted a pitch for ${lead.name}:\n\n${
      draft.subject ? `Subject: ${draft.subject}\n\n` : ""
    }${draft.body}\n\nOpen it from the brand's page to send.`;
  }

  if (intent.kind === "proposal") {
    const draft = await draftProposal(
      { name: agent.name },
      { name: lead.name, company: lead.company },
      creatorContext,
      creatorName,
      research
    );
    await db.insert(proposals).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      title: draft.title,
      body: draft.body,
      products: draft.packages,
      status: "draft",
    });
    await db.insert(activity).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      type: "proposal_drafted",
      text: `Drafted a proposal for ${lead.name}`,
    });
    return `${prefix}Drafted a proposal for ${lead.name} — "${draft.title}". See it on the brand's page to review.`;
  }

  if (intent.kind === "followup") {
    const priorRows = await db
      .select()
      .from(outreachDrafts)
      .where(eq(outreachDrafts.leadId, lead.id))
      .orderBy(desc(outreachDrafts.createdAt))
      .limit(1);
    const prior = priorRows[0];
    if (!prior) {
      return `${prefix}I don't have a pitch to build on for ${lead.name} yet — draft one first, then I can follow up.`;
    }
    const draft = await draftFollowup(
      { name: agent.name },
      { name: lead.name, company: lead.company },
      { subject: prior.subject, body: prior.body },
      creatorContext,
      creatorName
    );
    await db.insert(outreachDrafts).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      subject: draft.subject || null,
      body: draft.body,
      rationale: draft.rationale,
      status: "draft",
    });
    await db.insert(activity).values({
      userId,
      agentId: agent.id,
      leadId: lead.id,
      type: "email_drafted",
      text: `Followed up with ${lead.name}`,
    });
    return `${prefix}Followed up with ${lead.name}:\n\n${draft.body}\n\nOpen it from the brand's page to send.`;
  }

  return `${prefix}Not sure what you'd like me to do with ${lead.name} — try "brief", "pitch", "proposal", "follow up", or "book a call".`;
}
