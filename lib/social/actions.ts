"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";

export async function disconnectSocialAccount(provider: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .delete(socialAccounts)
    .where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, provider)));

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
