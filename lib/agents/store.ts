import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { agents, agentConfig, agentStates, teams, teamMembers } from "@/lib/db/schema";
import {
  PRESET_DEAL_TEAM,
  TEAM_TEMPLATES,
  iconForCapabilities,
  type CapabilityId,
} from "@/lib/agentTypes";
import type { RosterAgent, RosterTeam } from "./types";

export async function listAgents(userId: string): Promise<RosterAgent[]> {
  const presetDefaults: RosterAgent[] = PRESET_DEAL_TEAM.map((p) => ({
    id: p.id,
    name: p.name,
    initials: p.initials,
    role: p.role,
    icon: p.icon,
    type: p.typeId,
    isPreset: true,
    capabilities: p.capabilities,
    goal: null,
    status: p.demoStatus,
    task: p.demoTask,
    score: p.demoScore,
  }));

  if (!isDbConfigured()) return presetDefaults;

  const db = getDb()!;
  const [configRows, stateRows, customRows] = await Promise.all([
    db.select().from(agentConfig).where(eq(agentConfig.userId, userId)),
    db.select().from(agentStates).where(eq(agentStates.userId, userId)),
    db.select().from(agents).where(eq(agents.userId, userId)),
  ]);

  const configByAgent = new Map(configRows.map((r) => [r.agentId, r]));
  const stateByAgent = new Map(stateRows.map((r) => [r.agentId, r]));

  const presetAgents: RosterAgent[] = presetDefaults
    .map((preset) => {
      const config = configByAgent.get(preset.id);
      const state = stateByAgent.get(preset.id);
      return {
        ...preset,
        role: config?.role || preset.role,
        goal: config?.goal || preset.goal,
        status: state?.paused ? ("paused" as const) : preset.status,
        removed: state?.removed ?? false,
      };
    })
    .filter((a) => !a.removed)
    .map(({ removed, ...rest }) => rest);

  const customAgents: RosterAgent[] = customRows
    .map((row) => {
      const state = stateByAgent.get(row.id);
      const caps = (row.capabilities as CapabilityId[]) ?? [];
      return {
        id: row.id,
        name: row.name,
        initials: row.initials,
        role: row.role,
        icon: iconForCapabilities(caps),
        type: "custom",
        isPreset: false,
        capabilities: caps,
        goal: row.goal,
        status: state?.paused ? ("paused" as const) : ("idle" as const),
        task: "Ready to get started",
        score: row.score ?? 0,
        removed: state?.removed ?? false,
      };
    })
    .filter((a) => !a.removed)
    .map(({ removed, ...rest }) => rest);

  return [...presetAgents, ...customAgents];
}

export async function getAgent(
  userId: string,
  agentId: string
): Promise<RosterAgent | null> {
  const roster = await listAgents(userId);
  return roster.find((a) => a.id === agentId) ?? null;
}

export async function listTeams(userId: string): Promise<RosterTeam[]> {
  const presetTeams: RosterTeam[] = TEAM_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    description: t.description,
    goal: t.goal,
    memberIds: t.members,
    isPreset: true,
  }));

  if (!isDbConfigured()) return presetTeams;

  const db = getDb()!;
  const [memberOverrideRows, customTeamRows] = await Promise.all([
    db.select().from(teamMembers).where(eq(teamMembers.userId, userId)),
    db.select().from(teams).where(eq(teams.userId, userId)),
  ]);

  const overrideByTeam = new Map(memberOverrideRows.map((r) => [r.teamId, r]));

  const mergedPresetTeams = presetTeams.map((t) => {
    const override = overrideByTeam.get(t.id);
    return override
      ? { ...t, memberIds: (override.members as string[]) ?? t.memberIds }
      : t;
  });

  const customTeams: RosterTeam[] = customTeamRows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon ?? "🤝",
    description: row.description,
    goal: row.goal,
    memberIds: (row.members as string[]) ?? [],
    isPreset: false,
  }));

  return [...mergedPresetTeams, ...customTeams];
}

export async function getTeam(
  userId: string,
  teamId: string
): Promise<RosterTeam | null> {
  const roster = await listTeams(userId);
  return roster.find((t) => t.id === teamId) ?? null;
}
