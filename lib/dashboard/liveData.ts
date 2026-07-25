import "server-only";
import { and, desc, eq, gte } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs, leads, activity } from "@/lib/db/schema";
import { listAgents } from "@/lib/agents/store";
import { getSocialAccount } from "@/lib/social/store";
import type { OrbitAgentData } from "@/components/OrbitDashboard";

const WORKED_ACTIVITY_TYPES = new Set([
  "lead_researched",
  "email_drafted",
  "proposal_drafted",
  "meeting_booked",
]);

const JOB_KIND_LABEL: Record<string, string> = {
  research: "Writing a brief for",
  outreach: "Drafting a pitch for",
  proposal: "Drafting a proposal for",
  "follow-up": "Following up with",
};

export interface DashboardLiveData {
  agents: OrbitAgentData[];
  centerNumber: number;
  activityFeed: string[];
  centerImageUrl: string | null;
}

export async function getDashboardLiveData(userId: string): Promise<DashboardLiveData> {
  const roster = await listAgents(userId);

  if (!isDbConfigured()) {
    return {
      agents: roster.map((a) => ({
        id: a.id,
        name: a.name,
        initials: a.initials,
        icon: a.icon,
        status: a.status,
        task: a.task,
        score: a.score,
      })),
      centerNumber: 0,
      activityFeed: [],
      centerImageUrl: null,
    };
  }

  const db = getDb()!;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const recentCutoff = new Date(now.getTime() - 90_000);

  const [runningJobs, monthActivityRows, feedRows] = await Promise.all([
    db.select().from(jobs).where(and(eq(jobs.userId, userId), eq(jobs.status, "running"))),
    db.select().from(activity).where(and(eq(activity.userId, userId), gte(activity.createdAt, monthStart))),
    db.select().from(activity).where(eq(activity.userId, userId)).orderBy(desc(activity.createdAt)).limit(6),
  ]);

  const brandsWorkedThisMonth = new Set(
    monthActivityRows
      .filter((a) => a.leadId && WORKED_ACTIVITY_TYPES.has(a.type))
      .map((a) => a.leadId)
  ).size;

  const countByAgent = new Map<string, number>();
  for (const a of monthActivityRows) {
    if (a.agentId) countByAgent.set(a.agentId, (countByAgent.get(a.agentId) ?? 0) + 1);
  }

  const recentByAgent = new Map<string, (typeof monthActivityRows)[number]>();
  for (const a of monthActivityRows) {
    if (a.agentId && a.createdAt >= recentCutoff) {
      const existing = recentByAgent.get(a.agentId);
      if (!existing || a.createdAt > existing.createdAt) recentByAgent.set(a.agentId, a);
    }
  }

  const runningByAgent = new Map(
    runningJobs.filter((j) => j.agentId).map((j) => [j.agentId as string, j])
  );

  const jobDescriptions = new Map<string, string>();
  for (const job of runningJobs) {
    if (!job.agentId) continue;
    const params = job.params as { leadId?: string } | null;
    const label = JOB_KIND_LABEL[job.kind] ?? "Working on";
    if (params?.leadId) {
      const rows = await db
        .select({ name: leads.name })
        .from(leads)
        .where(eq(leads.id, params.leadId))
        .limit(1);
      jobDescriptions.set(job.agentId, `${label} ${rows[0]?.name ?? "a brand"}…`);
    } else {
      jobDescriptions.set(job.agentId, "Working…");
    }
  }

  const agents: OrbitAgentData[] = roster.map((a) => {
    const activityCount = countByAgent.get(a.id) ?? 0;
    const score = Math.min(100, activityCount * 15);

    if (a.status === "paused") {
      return { id: a.id, name: a.name, initials: a.initials, icon: a.icon, status: "paused", task: "Paused", score };
    }

    const running = runningByAgent.get(a.id);
    if (running) {
      return {
        id: a.id,
        name: a.name,
        initials: a.initials,
        icon: a.icon,
        status: "working",
        task: jobDescriptions.get(a.id) ?? "Working…",
        score: score || 40,
      };
    }

    const recent = recentByAgent.get(a.id);
    if (recent) {
      return {
        id: a.id,
        name: a.name,
        initials: a.initials,
        icon: a.icon,
        status: "working",
        task: recent.text,
        score: score || 40,
      };
    }

    return {
      id: a.id,
      name: a.name,
      initials: a.initials,
      icon: a.icon,
      status: "idle",
      task: activityCount > 0 ? `${activityCount} action${activityCount === 1 ? "" : "s"} this month` : "Ready when you are",
      score,
    };
  });

  const tiktok = await getSocialAccount(userId, "tiktok");

  return {
    agents,
    centerNumber: brandsWorkedThisMonth,
    activityFeed: feedRows.map((r) => r.text),
    centerImageUrl: tiktok?.avatarUrl ?? null,
  };
}
