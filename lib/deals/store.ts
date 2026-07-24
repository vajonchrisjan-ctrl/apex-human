import "server-only";
import { and, eq, desc } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads, outreachDrafts, proposals } from "@/lib/db/schema";
import type { Lead, OutreachDraft, Proposal } from "./types";

function toLead(row: typeof leads.$inferSelect): Lead {
  return {
    id: row.id,
    userId: row.userId,
    agentId: row.agentId,
    name: row.name,
    title: row.title,
    company: row.company,
    email: row.email,
    status: row.status as Lead["status"],
    score: row.score,
    source: row.source as Lead["source"],
    review: row.review as Lead["review"],
    profileUrl: row.profileUrl,
    platform: row.platform,
    research: (row.research as Lead["research"]) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listLeads(userId: string): Promise<Lead[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(leads)
    .where(eq(leads.userId, userId))
    .orderBy(desc(leads.createdAt));
  return rows.map(toLead);
}

export async function getLead(userId: string, leadId: string): Promise<Lead | null> {
  if (!isDbConfigured()) return null;
  const db = getDb()!;
  const rows = await db
    .select()
    .from(leads)
    .where(and(eq(leads.userId, userId), eq(leads.id, leadId)))
    .limit(1);
  return rows[0] ? toLead(rows[0]) : null;
}

export async function listOutreachDrafts(userId: string, leadId: string): Promise<OutreachDraft[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, leadId)))
    .orderBy(desc(outreachDrafts.createdAt));
  return rows.map((row) => ({
    id: row.id,
    leadId: row.leadId,
    agentId: row.agentId,
    subject: row.subject,
    body: row.body,
    rationale: row.rationale,
    status: row.status as OutreachDraft["status"],
    createdAt: row.createdAt,
    sentAt: row.sentAt,
  }));
}

export async function listProposals(userId: string, leadId: string): Promise<Proposal[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.userId, userId), eq(proposals.leadId, leadId)))
    .orderBy(desc(proposals.createdAt));
  return rows.map((row) => ({
    id: row.id,
    leadId: row.leadId,
    agentId: row.agentId,
    title: row.title,
    body: row.body,
    packages: (row.products as string[]) ?? [],
    status: row.status as Proposal["status"],
    createdAt: row.createdAt,
    sentAt: row.sentAt,
  }));
}
