import "server-only";
import { and, eq, gte, asc } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings } from "@/lib/db/schema";
import type { Meeting } from "./types";

function toMeeting(row: typeof meetings.$inferSelect): Meeting {
  return {
    id: row.id,
    leadId: row.leadId,
    agentId: row.agentId,
    title: row.title,
    kind: row.kind as Meeting["kind"],
    whenAt: row.whenAt,
    whenLabel: row.whenLabel,
    createdAt: row.createdAt,
  };
}

export async function listUpcomingMeetings(userId: string): Promise<Meeting[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.userId, userId), gte(meetings.whenAt, new Date())))
    .orderBy(asc(meetings.whenAt));
  return rows.map(toMeeting);
}
