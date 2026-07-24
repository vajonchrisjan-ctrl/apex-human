export interface AnalyticsKpis {
  brandsTotal: number;
  pitchesTotal: number;
  proposalsTotal: number;
  callsBooked: number;
  bookedRate: number;
}

export interface DailyActivityPoint {
  date: string;
  label: string;
  count: number;
}

export interface AgentRankingRow {
  agentId: string;
  name: string;
  initials: string;
  count: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKpis;
  dailyActivity: DailyActivityPoint[];
  agentRanking: AgentRankingRow[];
}
