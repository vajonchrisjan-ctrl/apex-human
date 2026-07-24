import type { CapabilityId } from "@/lib/agentTypes";

export interface RosterAgent {
  id: string;
  name: string;
  initials: string;
  role: string;
  icon: string;
  type: string;
  isPreset: boolean;
  capabilities: CapabilityId[];
  goal: string | null;
  status: "working" | "idle" | "paused";
  task: string;
  score: number;
}

export interface RosterTeam {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  goal: string | null;
  memberIds: string[];
  isPreset: boolean;
}
