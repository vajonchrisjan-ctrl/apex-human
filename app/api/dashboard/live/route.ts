export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDashboardLiveData } from "@/lib/dashboard/liveData";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ agents: [], centerNumber: 0, activityFeed: [], centerImageUrl: null });
  }
  const data = await getDashboardLiveData(userId);
  return NextResponse.json(data);
}
