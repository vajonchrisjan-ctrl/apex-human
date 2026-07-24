export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isDbConfigured } from "@/lib/db";
import { runDiscovery } from "@/lib/scrape/runDiscovery";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) {
    return NextResponse.json({ added: 0 });
  }

  const body = await request.json().catch(() => ({}));
  const category = typeof body.category === "string" ? body.category : "";

  const result = await runDiscovery(userId, category);
  return NextResponse.json(result);
}
