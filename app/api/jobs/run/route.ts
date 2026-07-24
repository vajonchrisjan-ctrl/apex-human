export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray, desc } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs, leads, activity, outreachDrafts, proposals } from "@/lib/db/schema";
import { draftResearch } from "@/lib/ai/research";
import { draftOutreach } from "@/lib/ai/outreach";
import { draftProposal } from "@/lib/ai/proposal";
import { draftFollowup } from "@/lib/ai/followup";
import { getCreatorProfile, profileSummary, creatorDisplayName } from "@/lib/profile/store";
import { listAgents } from "@/lib/agents/store";

const HANDLED_KINDS = ["research", "outreach", "proposal", "follow-up"];
const BATCH_SIZE = 5;
const CONCURRENCY = 4;

export async function POST() {
  const { userId: authUserId } = await auth();
  if (!authUserId || !isDbConfigured()) {
    return NextResponse.json({ processed: 0 });
  }
  const userId: string = authUserId;

  const db = getDb()!;

  const candidateRows = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        eq(jobs.userId, userId),
        eq(jobs.status, "queued"),
        inArray(jobs.kind, HANDLED_KINDS)
      )
    )
    .limit(BATCH_SIZE);

  const claimed: (typeof jobs.$inferSelect)[] = [];
  for (const candidate of candidateRows) {
    const updated = await db
      .update(jobs)
      .set({ status: "running", startedAt: new Date() })
      .where(and(eq(jobs.id, candidate.id), eq(jobs.status, "queued")))
      .returning();
    if (updated.length) claimed.push(updated[0]);
  }

  if (!claimed.length) {
    return NextResponse.json({ processed: 0 });
  }

  const [profile, creatorName, roster] = await Promise.all([
    getCreatorProfile(userId),
    creatorDisplayName(),
    listAgents(userId),
  ]);
  const creatorContext = profileSummary(profile);

  function resolveAgent(agentId: string | null, preferredType: string, fallbackName: string) {
    return (
      roster.find((a) => a.id === agentId) ??
      roster.find((a) => a.type === preferredType) ?? { name: fallbackName }
    );
  }

  async function getLead(leadId: string) {
    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.userId, userId), eq(leads.id, leadId)))
      .limit(1);
    const lead = rows[0];
    if (!lead) throw new Error("Brand not found");
    return lead;
  }

  async function processJob(job: typeof jobs.$inferSelect) {
    try {
      if (job.kind === "research") {
        const params = job.params as { leadId: string };
        const lead = await getLead(params.leadId);
        const jobAgent = resolveAgent(job.agentId, "discovery", "Research");

        const brief = await draftResearch(
          { name: jobAgent.name },
          { name: lead.name, company: lead.company, platform: lead.platform, email: lead.email },
          creatorContext,
          creatorName
        );

        await db.update(leads).set({ research: brief, updatedAt: new Date() }).where(eq(leads.id, lead.id));
        await db.insert(activity).values({
          userId,
          agentId: job.agentId,
          leadId: lead.id,
          type: "lead_researched",
          text: `Wrote a brand brief for ${lead.name}`,
        });
        await db.update(jobs).set({ status: "done", result: brief, finishedAt: new Date() }).where(eq(jobs.id, job.id));
        return;
      }

      if (job.kind === "outreach") {
        const params = job.params as { leadId: string };
        const lead = await getLead(params.leadId);
        const jobAgent = resolveAgent(job.agentId, "outreach", "Initial Outreach");

        const draft = await draftOutreach(
          { name: jobAgent.name },
          { name: lead.name, company: lead.company, email: lead.email, platform: lead.platform },
          creatorContext,
          creatorName,
          (lead.research as import("@/lib/ai/research").ResearchResult | null) ?? undefined
        );

        await db.insert(outreachDrafts).values({
          userId,
          agentId: job.agentId,
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
          agentId: job.agentId,
          leadId: lead.id,
          type: "email_drafted",
          text: `Drafted a pitch for ${lead.name}`,
        });
        await db.update(jobs).set({ status: "done", result: draft, finishedAt: new Date() }).where(eq(jobs.id, job.id));
        return;
      }

      if (job.kind === "proposal") {
        const params = job.params as { leadId: string };
        const lead = await getLead(params.leadId);
        const jobAgent = resolveAgent(job.agentId, "proposal", "Proposal");

        const draft = await draftProposal(
          { name: jobAgent.name },
          { name: lead.name, company: lead.company },
          creatorContext,
          creatorName,
          (lead.research as import("@/lib/ai/research").ResearchResult | null) ?? undefined
        );

        await db.insert(proposals).values({
          userId,
          agentId: job.agentId,
          leadId: lead.id,
          title: draft.title,
          body: draft.body,
          products: draft.packages,
          status: "draft",
        });

        await db.insert(activity).values({
          userId,
          agentId: job.agentId,
          leadId: lead.id,
          type: "proposal_drafted",
          text: `Drafted a proposal for ${lead.name}`,
        });
        await db.update(jobs).set({ status: "done", result: draft, finishedAt: new Date() }).where(eq(jobs.id, job.id));
        return;
      }

      if (job.kind === "follow-up") {
        const params = job.params as { leadId: string };
        const lead = await getLead(params.leadId);

        const priorRows = await db
          .select()
          .from(outreachDrafts)
          .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, lead.id)))
          .orderBy(desc(outreachDrafts.createdAt))
          .limit(1);
        const prior = priorRows[0];
        if (!prior) throw new Error("No prior pitch to follow up on — draft a pitch first.");

        const jobAgent = resolveAgent(job.agentId, "followup", "Follow-up");

        const draft = await draftFollowup(
          { name: jobAgent.name },
          { name: lead.name, company: lead.company },
          { subject: prior.subject, body: prior.body },
          creatorContext,
          creatorName
        );

        await db.insert(outreachDrafts).values({
          userId,
          agentId: job.agentId,
          leadId: lead.id,
          subject: draft.subject || null,
          body: draft.body,
          rationale: draft.rationale,
          status: "draft",
        });

        await db.insert(activity).values({
          userId,
          agentId: job.agentId,
          leadId: lead.id,
          type: "email_drafted",
          text: `Followed up with ${lead.name}`,
        });
        await db.update(jobs).set({ status: "done", result: draft, finishedAt: new Date() }).where(eq(jobs.id, job.id));
        return;
      }
    } catch (err) {
      await db
        .update(jobs)
        .set({
          status: "failed",
          error: err instanceof Error ? err.message : "Something went wrong",
          finishedAt: new Date(),
        })
        .where(eq(jobs.id, job.id));
    }
  }

  const queue = [...claimed];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const job = queue.shift();
      if (job) await processJob(job);
    }
  });
  await Promise.all(workers);

  return NextResponse.json({ processed: claimed.length });
}
