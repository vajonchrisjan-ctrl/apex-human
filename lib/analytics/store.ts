import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads, outreachDrafts, proposals, meetings, activity } from "@/lib/db/schema";
import { listAgents } from "@/lib/agents/store";
import type { AnalyticsData } from "./types";

const EMPTY: AnalyticsData = {
  kpis: { brandsTotal: 0, pitchesTotal: 0, proposalsTotal: 0, callsBooked: 0, bookedRate: 0 },
  dailyActivity: [],
  agentRanking: [],
};

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  if (!isDbConfigured()) return EMPTY;

  const db = getDb()!;
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [leadRows, draftRows, proposalRows, meetingRows, activityRows, roster] = await Promise.all([
    db.select().from(leads).where(eq(leads.userId, userId)),
    db.select({ id: outreachDrafts.id }).from(outreachDrafts).where(eq(outreachDrafts.userId, userId)),
    db.select({ id: proposals.id }).from(proposals).where(eq(proposals.userId, userId)),
    db.select({ id: meetings.id }).from(meetings).where(eq(meetings.userId, userId)),
    db
      .select()
      .from(activity)
      .where(and(eq(activity.userId, userId), gte(activity.createdAt, fourteenDaysAgo))),
    listAgents(userId),
  ]);

  const accepted = leadRows.filter((l) => l.review === "accepted");
  const booked = accepted.filter((l) => l.status === "booked");

  const kpis = {
    brandsTotal: accepted.length,
    pitchesTotal: draftRows.length,
    proposalsTotal: proposalRows.length,
    callsBooked: meetingRows.length,
    bookedRate: accepted.length ? Math.round((booked.length / accepted.length) * 100) : 0,
  };

  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  for (const a of activityRows) {
    const key = a.createdAt.toISOString().slice(0, 10);
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].count++;
  }

  const countByAgent = new Map<string, number>();
  for (const a of activityRows) {
    if (a.agentId) countByAgent.set(a.agentId, (countByAgent.get(a.agentId) ?? 0) + 1);
  }
  const agentRanking = roster
    .map((a) => ({
      agentId: a.id,
      name: a.name,
      initials: a.initials,
      count: countByAgent.get(a.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { kpis, dailyActivity: days, agentRanking };
}
