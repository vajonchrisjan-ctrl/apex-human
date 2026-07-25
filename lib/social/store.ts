import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";

export interface SocialAccount {
  provider: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  connectedAt: Date;
}

export async function getSocialAccount(
  userId: string,
  provider: string
): Promise<SocialAccount | null> {
  if (!isDbConfigured()) return null;
  const db = getDb()!;
  const rows = await db
    .select()
    .from(socialAccounts)
    .where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, provider)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const snapshot = (row.snapshot as { followerCount?: number } | null) ?? null;
  return {
    provider: row.provider,
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    followerCount: snapshot?.followerCount ?? null,
    connectedAt: row.connectedAt,
  };
}
