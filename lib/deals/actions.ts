"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads, activity, jobs, outreachDrafts, proposals } from "@/lib/db/schema";
import type { LeadStatus } from "./types";

const HEADER_ALIASES: Record<string, string[]> = {
  name: ["name", "contact", "contact name", "brand"],
  company: ["company", "brand name", "organization", "org"],
  email: ["email", "e-mail", "contact email"],
  platform: ["platform", "channel"],
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

function resolveHeaderIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(h.trim().toLowerCase()));
}

export async function addLead(input: {
  name: string;
  title: string;
  company: string;
  email: string;
  platform: string;
  agentId: string;
}) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };
  if (!input.name.trim()) return { ok: false as const };

  const db = getDb()!;
  const [row] = await db
    .insert(leads)
    .values({
      userId,
      agentId: input.agentId || null,
      name: input.name.trim(),
      title: input.title.trim() || null,
      company: input.company.trim() || null,
      email: input.email.trim() || null,
      platform: input.platform.trim() || null,
      status: "new",
      source: "manual",
      review: "accepted",
    })
    .returning();

  await db.insert(activity).values({
    userId,
    agentId: input.agentId || null,
    leadId: row.id,
    type: "lead_added",
    text: `Added ${input.name.trim()} to the pipeline`,
  });

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function importLeadsCsv(csvText: string, agentId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { count: 0 };

  const rows = parseCsv(csvText);
  if (!rows.length) return { count: 0 };

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const nameIdx = resolveHeaderIndex(headers, HEADER_ALIASES.name);
  const companyIdx = resolveHeaderIndex(headers, HEADER_ALIASES.company);
  const emailIdx = resolveHeaderIndex(headers, HEADER_ALIASES.email);
  const platformIdx = resolveHeaderIndex(headers, HEADER_ALIASES.platform);

  const db = getDb()!;
  let count = 0;

  for (const row of rows.slice(1)) {
    const name = nameIdx >= 0 ? row[nameIdx]?.trim() : "";
    const company = companyIdx >= 0 ? row[companyIdx]?.trim() : "";
    if (!name && !company) continue;

    await db.insert(leads).values({
      userId,
      agentId: agentId || null,
      name: name || company,
      company: company || null,
      email: emailIdx >= 0 ? row[emailIdx]?.trim() || null : null,
      platform: platformIdx >= 0 ? row[platformIdx]?.trim() || null : null,
      status: "new",
      source: "manual",
      review: "accepted",
    });
    count++;
  }

  if (count > 0) {
    await db.insert(activity).values({
      userId,
      agentId: agentId || null,
      type: "lead_added",
      text: `Imported ${count} brand${count === 1 ? "" : "s"} from a CSV`,
    });
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { count };
}

export async function setLeadStage(leadId: string, status: LeadStatus) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, leadId)));

  revalidatePath("/deals");
}

export async function acceptLead(leadId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .update(leads)
    .set({ review: "accepted", updatedAt: new Date() })
    .where(and(eq(leads.userId, userId), eq(leads.id, leadId)));

  revalidatePath("/deals");
}

export async function rejectLead(leadId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.delete(leads).where(and(eq(leads.userId, userId), eq(leads.id, leadId)));

  revalidatePath("/deals");
}

export async function runResearch(leadId: string, agentId: string | null) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.insert(jobs).values({
    userId,
    agentId: agentId ?? null,
    kind: "research",
    status: "queued",
    params: { leadId },
  });

  revalidatePath(`/deals/${leadId}`);
}

export async function runOutreach(leadId: string, agentId: string | null) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.insert(jobs).values({
    userId,
    agentId: agentId ?? null,
    kind: "outreach",
    status: "queued",
    params: { leadId },
  });

  revalidatePath(`/deals/${leadId}`);
}

export async function runProposal(leadId: string, agentId: string | null) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db.insert(jobs).values({
    userId,
    agentId: agentId ?? null,
    kind: "proposal",
    status: "queued",
    params: { leadId },
  });

  revalidatePath(`/deals/${leadId}`);
}

export async function runFollowup(leadId: string, agentId: string | null) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };

  const db = getDb()!;
  const priorRows = await db
    .select({ id: outreachDrafts.id })
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, leadId)))
    .limit(1);
  if (!priorRows.length) return { ok: false as const, reason: "no-pitch" as const };

  await db.insert(jobs).values({
    userId,
    agentId: agentId ?? null,
    kind: "follow-up",
    status: "queued",
    params: { leadId },
  });

  revalidatePath(`/deals/${leadId}`);
  return { ok: true as const };
}

export async function markDraftSent(draftId: string, leadId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .update(outreachDrafts)
    .set({ status: "sent", sentAt: new Date() })
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.id, draftId)));

  revalidatePath(`/deals/${leadId}`);
}

export async function markProposalSent(proposalId: string, leadId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .update(proposals)
    .set({ status: "sent", sentAt: new Date() })
    .where(and(eq(proposals.userId, userId), eq(proposals.id, proposalId)));

  revalidatePath(`/deals/${leadId}`);
}
