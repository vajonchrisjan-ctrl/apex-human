import { auth } from "@clerk/nextjs/server";
import { getAnalyticsData } from "@/lib/analytics/store";
import KpiTiles from "@/components/analytics/KpiTiles";
import ActivityChart from "@/components/analytics/ActivityChart";
import AgentRanking from "@/components/analytics/AgentRanking";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const data = userId
    ? await getAnalyticsData(userId)
    : { kpis: { brandsTotal: 0, pitchesTotal: 0, proposalsTotal: 0, callsBooked: 0, bookedRate: 0 }, dailyActivity: [], agentRanking: [] };

  return (
    <div>
      <p className="eyebrow">Analytics</p>
      <h1 className="heading">How your team is doing.</h1>

      <KpiTiles kpis={data.kpis} />
      <ActivityChart days={data.dailyActivity} />
      <AgentRanking rows={data.agentRanking} />
    </div>
  );
}
