"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";

export async function dismissNotification(id: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .update(activity)
    .set({ dismissed: true })
    .where(and(eq(activity.userId, userId), eq(activity.id, id)));
}

export async function clearAllNotifications() {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .update(activity)
    .set({ dismissed: true })
    .where(and(eq(activity.userId, userId), eq(activity.dismissed, false)));
}
