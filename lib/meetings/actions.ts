"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings, leads, activity } from "@/lib/db/schema";
import { parseMeetingText } from "@/lib/ai/meetingTime";
import { listAgents } from "@/lib/agents/store";

export async function bookMeetingFromText(text: string, leadIdHint?: string | null) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };
  if (!text.trim()) return { ok: false as const };

  const db = getDb()!;
  const parsed = await parseMeetingText(text.trim(), new Date().toISOString());

  let leadId: string | null = leadIdHint ?? null;
  let title = parsed.title;

  if (leadId) {
    const rows = await db
      .select()
      .from(leads)
      .where(and(eq(leads.userId, userId), eq(leads.id, leadId)))
      .limit(1);
    if (rows[0]) title = `Call with ${rows[0].name}`;
  } else if (parsed.brandMention) {
    const rows = await db.select().from(leads).where(eq(leads.userId, userId));
    const mention = parsed.brandMention.toLowerCase();
    const match = rows.find(
      (l) => l.name.toLowerCase().includes(mention) || mention.includes(l.name.toLowerCase())
    );
    if (match) {
      leadId = match.id;
      title = `Call with ${match.name}`;
    }
  }

  const roster = await listAgents(userId);
  const schedulerAgent = roster.find((a) => a.type === "scheduler");

  await db.insert(meetings).values({
    userId,
    agentId: schedulerAgent?.id ?? null,
    leadId,
    title,
    kind: "call",
    whenAt: new Date(parsed.whenAt),
    whenLabel: parsed.whenLabel,
  });

  if (leadId) {
    await db
      .update(leads)
      .set({ status: "booked", updatedAt: new Date() })
      .where(eq(leads.id, leadId));
  }

  await db.insert(activity).values({
    userId,
    agentId: schedulerAgent?.id ?? null,
    leadId,
    type: "meeting_booked",
    text: `Booked ${title} — ${parsed.whenLabel}`,
  });

  revalidatePath("/calendar");
  revalidatePath("/deals");
  if (leadId) revalidatePath(`/deals/${leadId}`);

  return { ok: true as const, title, whenLabel: parsed.whenLabel };
}
