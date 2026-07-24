"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import type { CreatorProfileInput } from "./types";

export async function saveCreatorProfile(input: CreatorProfileInput) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };

  const db = getDb();
  const values = {
    niche: input.niche || null,
    bio: input.bio || null,
    platforms: input.platforms,
    audience: input.audience,
    tone: input.tone || null,
    pastDeals: input.pastDeals || null,
    rateFloor: input.rateFloor,
  };

  await db!
    .insert(creatorProfile)
    .values({ userId, ...values })
    .onConflictDoUpdate({
      target: creatorProfile.userId,
      set: { ...values, updatedAt: new Date() },
    });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return { ok: true as const };
}
