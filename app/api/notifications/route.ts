export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listRecentActivity } from "@/lib/notifications/store";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ items: [] });
  const items = await listRecentActivity(userId, 10);
  return NextResponse.json({ items });
}
