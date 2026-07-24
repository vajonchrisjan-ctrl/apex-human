"use client";

import { useEffect, useState } from "react";
import OrbitDashboard, { type OrbitAgentData } from "@/components/OrbitDashboard";

export default function DashboardLive({
  initialAgents,
  initialCenterNumber,
  initialFeed,
}: {
  initialAgents: OrbitAgentData[];
  initialCenterNumber: number;
  initialFeed: string[];
}) {
  const [agents, setAgents] = useState(initialAgents);
  const [centerNumber, setCenterNumber] = useState(initialCenterNumber);
  const [feed, setFeed] = useState(initialFeed);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/dashboard/live");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setAgents(data.agents ?? []);
        setCenterNumber(data.centerNumber ?? 0);
        setFeed(data.activityFeed ?? []);
      } catch {
        // ignore transient poll failures
      }
    }

    const id = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <OrbitDashboard
      agents={agents}
      centerNumber={centerNumber}
      centerLabel="brands worked this month"
      activityFeed={feed}
    />
  );
}
