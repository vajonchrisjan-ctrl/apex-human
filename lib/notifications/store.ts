import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import type { NotificationItem } from "./types";

export async function listRecentActivity(userId: string, limit = 10): Promise<NotificationItem[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(activity)
    .where(and(eq(activity.userId, userId), eq(activity.dismissed, false)))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    text: r.text,
    leadId: r.leadId,
    createdAt: r.createdAt,
  }));
}
