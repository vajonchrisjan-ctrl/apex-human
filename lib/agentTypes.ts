export type CapabilityId =
  | "scrape"
  | "research"
  | "outreach"
  | "proposal"
  | "follow-up"
  | "book-meeting";

export interface AgentTypeDef {
  id: string;
  label: string;
  capability: CapabilityId;
  jobKind: string;
}

export const AGENT_TYPES: AgentTypeDef[] = [
  { id: "discovery", label: "Research", capability: "scrape", jobKind: "scrape" },
  { id: "outreach", label: "Initial Outreach", capability: "outreach", jobKind: "outreach" },
  { id: "proposal", label: "Proposal", capability: "proposal", jobKind: "proposal" },
  { id: "followup", label: "Follow-up", capability: "follow-up", jobKind: "follow-up" },
  { id: "scheduler", label: "Scheduler", capability: "book-meeting", jobKind: "book-meeting" },
];

export const CAPABILITY_LABELS: Record<CapabilityId, string> = {
  scrape: "Research",
  research: "Brand brief",
  outreach: "Initial Outreach",
  proposal: "Proposals",
  "follow-up": "Follow-ups",
  "book-meeting": "Scheduling",
};

export const CAPABILITY_ICONS: Record<CapabilityId, string> = {
  scrape: "🔍",
  research: "🔍",
  outreach: "✉️",
  proposal: "📄",
  "follow-up": "🔁",
  "book-meeting": "📅",
};

export function iconForCapabilities(caps: CapabilityId[]): string {
  return CAPABILITY_ICONS[caps[0]] ?? "✨";
}

export interface PresetAgent {
  id: string;
  typeId: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  icon: string;
  capabilities: CapabilityId[];
  demoStatus: "working" | "idle";
  demoTask: string;
  demoScore: number;
}

export const PRESET_DEAL_TEAM: PresetAgent[] = [
  {
    id: "discovery",
    typeId: "discovery",
    name: "Remy Rivera",
    initials: "RR",
    role: "Research",
    color: "#0EA5E9",
    icon: "🔍",
    capabilities: ["scrape", "research"],
    demoStatus: "working",
    demoTask: "Scanning sponsor lists for brands in your niche…",
    demoScore: 74,
  },
  {
    id: "outreach",
    typeId: "outreach",
    name: "Otis Vance",
    initials: "OV",
    role: "Initial Outreach",
    color: "#5122C1",
    icon: "✉️",
    capabilities: ["outreach"],
    demoStatus: "working",
    demoTask: "Drafting a pitch for Northbound Coffee…",
    demoScore: 88,
  },
  {
    id: "proposal",
    typeId: "proposal",
    name: "Priya Shah",
    initials: "PS",
    role: "Proposal",
    color: "#7C3AED",
    icon: "📄",
    capabilities: ["proposal"],
    demoStatus: "working",
    demoTask: "Pricing a Q3 package for Lumen Skincare…",
    demoScore: 63,
  },
  {
    id: "followup",
    typeId: "followup",
    name: "Faye Cole",
    initials: "FC",
    role: "Follow-up",
    color: "#8B5CF6",
    icon: "🔁",
    capabilities: ["follow-up"],
    demoStatus: "working",
    demoTask: "Following up with Trailhead Gear…",
    demoScore: 55,
  },
  {
    id: "scheduler",
    typeId: "scheduler",
    name: "Sam Okafor",
    initials: "SO",
    role: "Scheduler",
    color: "#F43F7E",
    icon: "📅",
    capabilities: ["book-meeting"],
    demoStatus: "working",
    demoTask: "Booking a call with Verve Audio…",
    demoScore: 91,
  },
];

export interface TeamTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  goal: string;
  members: string[];
}

export const TEAM_TEMPLATES: TeamTemplate[] = [
  {
    id: "deal-team",
    name: "Deal Team",
    icon: "🤝",
    description: "Your five specialists — discovery through booking.",
    goal: "Find brands, pitch them, price the deal, follow up, and book the call.",
    members: PRESET_DEAL_TEAM.map((a) => a.id),
  },
];
