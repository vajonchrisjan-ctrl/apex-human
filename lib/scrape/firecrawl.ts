import "server-only";

export function isFirecrawlConfigured(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY);
}

export interface FirecrawlSearchResult {
  title: string;
  url: string;
  description: string;
}

export async function firecrawlSearch(
  query: string,
  limit = 8
): Promise<FirecrawlSearchResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({ query, limit }),
    });

    if (!res.ok) {
      throw new Error(`Firecrawl request failed (${res.status})`);
    }

    const data = await res.json();
    const results = data?.data?.web ?? data?.data ?? [];
    return (Array.isArray(results) ? results : []).map(
      (r: { title?: string; url?: string; description?: string; markdown?: string }) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        description: r.description ?? r.markdown?.slice(0, 300) ?? "",
      })
    );
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
