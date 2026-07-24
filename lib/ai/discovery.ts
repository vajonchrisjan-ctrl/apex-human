import "server-only";
import { geminiJSON, isGeminiConfigured } from "./gemini";
import type { FirecrawlSearchResult } from "@/lib/scrape/firecrawl";

export interface BrandCandidate {
  name: string;
  company: string;
  platform: string;
  profileUrl: string;
}

const DISCOVERY_SCHEMA = {
  type: "object",
  properties: {
    brands: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          company: { type: "string" },
          platform: { type: "string" },
          profileUrl: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  required: ["brands"],
};

export async function extractBrandCandidates(
  niche: string,
  results: FirecrawlSearchResult[]
): Promise<BrandCandidate[]> {
  if (!isGeminiConfigured() || !results.length) return naiveBrandCandidates(results);

  const system = `You are a brand-discovery assistant for a content creator whose niche is: ${niche}. You'll be given raw web search results. Extract a clean list of distinct BRAND or COMPANY names that look like real potential sponsors for a creator in this niche — skip results that are just blog posts, listicles, or news articles that aren't actual brands. For each, give a short "company" name, a rough "platform" (e.g. "Website", "Instagram") if apparent, and "profileUrl" using the given URL. Return at most 8 distinct brands, deduplicated.`;

  const turns = [
    {
      role: "user" as const,
      text: results
        .map((r, i) => `${i + 1}. ${r.title}\n${r.url}\n${r.description}`)
        .join("\n\n"),
    },
  ];

  try {
    const result = await geminiJSON<{ brands: BrandCandidate[] }>(
      system,
      turns,
      DISCOVERY_SCHEMA,
      { maxTokens: 800, temperature: 0.4 }
    );
    const brands = (result.brands ?? []).filter((b) => b.name?.trim()).slice(0, 8);
    return brands.length ? brands : naiveBrandCandidates(results);
  } catch {
    return naiveBrandCandidates(results);
  }
}

export function naiveBrandCandidates(results: FirecrawlSearchResult[]): BrandCandidate[] {
  return results.slice(0, 6).map((r) => ({
    name: r.title || r.url,
    company: r.title || "",
    platform: "Website",
    profileUrl: r.url,
  }));
}

export function fallbackBrands(niche: string): BrandCandidate[] {
  return [
    {
      name: "Northbound Coffee",
      company: "Northbound Coffee Co.",
      platform: "Website",
      profileUrl: "",
    },
    {
      name: `${niche.split(" ")[0] || "Everyday"} Supply Co.`,
      company: "",
      platform: "Website",
      profileUrl: "",
    },
    {
      name: "Trailhead Gear",
      company: "Trailhead Outdoor Gear",
      platform: "Website",
      profileUrl: "",
    },
  ];
}
