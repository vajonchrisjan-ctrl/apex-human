import "server-only";
import { eq } from "drizzle-orm";
import { currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import type { CreatorProfileData } from "./types";

export async function getCreatorProfile(
  userId: string
): Promise<CreatorProfileData | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db!
    .select()
    .from(creatorProfile)
    .where(eq(creatorProfile.userId, userId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  return {
    niche: row.niche,
    bio: row.bio,
    platforms: (row.platforms as CreatorProfileData["platforms"]) ?? [],
    audience: (row.audience as CreatorProfileData["audience"]) ?? {},
    tone: row.tone,
    pastDeals: row.pastDeals,
    rateFloor: row.rateFloor,
  };
}

export function isProfileComplete(profile: CreatorProfileData | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.niche && profile.platforms.length > 0 && profile.rateFloor != null
  );
}

export function profileSummary(profile: CreatorProfileData | null): string {
  if (!profile) return "No creator profile on file yet.";

  const lines: string[] = [];
  if (profile.niche) lines.push(`Niche: ${profile.niche}`);
  if (profile.bio) lines.push(`Bio: ${profile.bio}`);

  if (profile.platforms.length) {
    const platformLines = profile.platforms
      .map(
        (p) =>
          `${p.platform} @${p.handle} — ${p.followers.toLocaleString()} followers, ${p.engagementRate}% engagement`
      )
      .join("; ");
    lines.push(`Platforms: ${platformLines}`);
  }

  const audienceParts = [
    profile.audience.age,
    profile.audience.geo,
    profile.audience.gender,
  ].filter(Boolean);
  if (audienceParts.length) lines.push(`Audience: ${audienceParts.join(", ")}`);

  if (profile.tone) lines.push(`Tone: ${profile.tone}`);
  if (profile.pastDeals) lines.push(`Past deals: ${profile.pastDeals}`);
  if (profile.rateFloor != null) lines.push(`Rate floor: $${profile.rateFloor}`);

  return lines.join("\n");
}

export async function creatorDisplayName(): Promise<string> {
  const user = await clerkCurrentUser();
  return user?.firstName || user?.fullName || user?.username || "there";
}
