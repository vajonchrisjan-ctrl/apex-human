import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, activity } from "@/lib/db/schema";
import { firecrawlSearch, isFirecrawlConfigured } from "@/lib/scrape/firecrawl";
import { extractBrandCandidates, naiveBrandCandidates, fallbackBrands } from "@/lib/ai/discovery";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { getCreatorProfile } from "@/lib/profile/store";
import { listAgents } from "@/lib/agents/store";

export async function runDiscovery(
  userId: string,
  categoryOverride?: string
): Promise<{ added: number; niche: string }> {
  const profile = await getCreatorProfile(userId);
  const niche = categoryOverride?.trim() || profile?.niche || "content creation";

  let candidates;
  if (!isFirecrawlConfigured()) {
    candidates = fallbackBrands(niche);
  } else {
    const results = await firecrawlSearch(`brands that sponsor ${niche} content creators`, 8);
    candidates = isGeminiConfigured()
      ? await extractBrandCandidates(niche, results)
      : naiveBrandCandidates(results);
    if (!candidates.length) candidates = fallbackBrands(niche);
  }

  const db = getDb()!;
  const [existingRows, roster] = await Promise.all([
    db.select({ name: leads.name }).from(leads).where(eq(leads.userId, userId)),
    listAgents(userId),
  ]);
  const existingNames = new Set(existingRows.map((r) => r.name.trim().toLowerCase()));
  const discoveryAgent = roster.find((a) => a.type === "discovery");

  let added = 0;
  for (const c of candidates) {
    const name = c.name?.trim();
    if (!name || existingNames.has(name.toLowerCase())) continue;

    await db.insert(leads).values({
      userId,
      agentId: discoveryAgent?.id ?? null,
      name,
      company: c.company?.trim() || null,
      platform: c.platform?.trim() || null,
      profileUrl: c.profileUrl?.trim() || null,
      status: "new",
      source: "scrape",
      review: "pending",
    });
    existingNames.add(name.toLowerCase());
    added++;
  }

  if (added > 0) {
    await db.insert(activity).values({
      userId,
      agentId: discoveryAgent?.id ?? null,
      type: "lead_added",
      text: `Found ${added} brand${added === 1 ? "" : "s"} in your niche — waiting for your review`,
    });
  }

  return { added, niche };
}
