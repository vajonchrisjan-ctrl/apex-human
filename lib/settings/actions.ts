"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function updateNotifications(formData: FormData) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const dealActivity = formData.get("dealActivity") === "on";
  const weeklySummary = formData.get("weeklySummary") === "on";

  const db = getDb();
  await db
    ?.update(users)
    .set({ notifications: { dealActivity, weeklySummary } })
    .where(eq(users.id, userId));

  revalidatePath("/settings");
}
