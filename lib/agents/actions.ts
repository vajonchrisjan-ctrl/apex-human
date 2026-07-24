"use server";

import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { agents, agentConfig, agentStates, teams, teamMembers } from "@/lib/db/schema";
import { PRESET_DEAL_TEAM, TEAM_TEMPLATES, type CapabilityId } from "@/lib/agentTypes";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function isPresetAgent(id: string) {
  return PRESET_DEAL_TEAM.some((p) => p.id === id);
}

function isPresetTeam(id: string) {
  return TEAM_TEMPLATES.some((t) => t.id === id);
}

export async function createAgent(input: {
  name: string;
  role: string;
  goal: string;
  capabilities: CapabilityId[];
}) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };
  if (!input.name.trim() || !input.capabilities.length) return { ok: false as const };

  const db = getDb()!;
  const id = randomUUID();

  await db.insert(agents).values({
    userId,
    id,
    name: input.name.trim(),
    initials: initialsFor(input.name),
    role: input.role.trim() || "Custom helper",
    status: "idle",
    goal: input.goal.trim() || null,
    type: "custom",
    capabilities: input.capabilities,
  });

  revalidatePath("/agents");
  revalidatePath("/dashboard");
  redirect(`/agents/${id}`);
}

export async function updateAgent(
  agentId: string,
  input: { role: string; goal: string }
) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };

  const db = getDb()!;

  if (isPresetAgent(agentId)) {
    await db
      .insert(agentConfig)
      .values({
        userId,
        agentId,
        role: input.role || null,
        goal: input.goal || null,
      })
      .onConflictDoUpdate({
        target: [agentConfig.userId, agentConfig.agentId],
        set: { role: input.role || null, goal: input.goal || null },
      });
  } else {
    await db
      .update(agents)
      .set({ role: input.role || "Custom helper", goal: input.goal || null })
      .where(and(eq(agents.userId, userId), eq(agents.id, agentId)));
  }

  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function setAgentPaused(agentId: string, paused: boolean) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .insert(agentStates)
    .values({ userId, agentId, paused, removed: false })
    .onConflictDoUpdate({
      target: [agentStates.userId, agentStates.agentId],
      set: { paused },
    });

  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/dashboard");
}

export async function removeAgent(agentId: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;

  const db = getDb()!;
  await db
    .insert(agentStates)
    .values({ userId, agentId, removed: true, paused: false })
    .onConflictDoUpdate({
      target: [agentStates.userId, agentStates.agentId],
      set: { removed: true },
    });

  revalidatePath("/agents");
  revalidatePath("/dashboard");
  redirect("/agents");
}

export async function createTeam(input: {
  name: string;
  description: string;
  goal: string;
  memberIds: string[];
}) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };
  if (!input.name.trim() || !input.memberIds.length) return { ok: false as const };

  const db = getDb()!;
  const id = randomUUID();

  await db.insert(teams).values({
    userId,
    id,
    name: input.name.trim(),
    icon: "🤝",
    iconBg: "#171717",
    description: input.description.trim() || null,
    goal: input.goal.trim() || null,
    members: input.memberIds,
  });

  revalidatePath("/agents");
  redirect(`/agents/teams/${id}`);
}

export async function updateTeam(
  teamId: string,
  input: { name: string; description: string; goal: string; memberIds: string[] }
) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return { ok: false as const };
  if (!input.memberIds.length) return { ok: false as const };

  const db = getDb()!;

  if (isPresetTeam(teamId)) {
    await db
      .insert(teamMembers)
      .values({ userId, teamId, members: input.memberIds })
      .onConflictDoUpdate({
        target: [teamMembers.userId, teamMembers.teamId],
        set: { members: input.memberIds },
      });
  } else {
    await db
      .update(teams)
      .set({
        name: input.name.trim(),
        description: input.description.trim() || null,
        goal: input.goal.trim() || null,
        members: input.memberIds,
      })
      .where(and(eq(teams.userId, userId), eq(teams.id, teamId)));
  }

  revalidatePath("/agents");
  revalidatePath(`/agents/teams/${teamId}`);
  return { ok: true as const };
}
