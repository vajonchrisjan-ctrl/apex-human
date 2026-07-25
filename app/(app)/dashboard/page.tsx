import { auth } from "@clerk/nextjs/server";
import { getDashboardLiveData } from "@/lib/dashboard/liveData";
import DashboardLive from "@/components/DashboardLive";

export default async function DashboardPage() {
  const { userId } = await auth();
  const data = userId
    ? await getDashboardLiveData(userId)
    : { agents: [], centerNumber: 0, activityFeed: [], centerImageUrl: null };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p className="eyebrow">Dashboard</p>
        <h1 className="heading">Your team, live.</h1>
      </div>
      <DashboardLive
        initialAgents={data.agents}
        initialCenterNumber={data.centerNumber}
        initialFeed={data.activityFeed}
        initialCenterImageUrl={data.centerImageUrl}
      />
    </div>
  );
}
