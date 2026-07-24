import "server-only";
import { eq, asc } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import type { ChatMessage } from "./types";

export async function listMessages(userId: string): Promise<ChatMessage[]> {
  if (!isDbConfigured()) return [];
  const db = getDb()!;
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(asc(messages.id));
  return rows.map((row) => ({
    id: row.id,
    agentId: row.agentId,
    who: row.who as ChatMessage["who"],
    text: row.text,
    createdAt: row.createdAt,
  }));
}
