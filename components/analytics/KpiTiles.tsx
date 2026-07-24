import type { AnalyticsKpis } from "@/lib/analytics/types";

export default function KpiTiles({ kpis }: { kpis: AnalyticsKpis }) {
  const tiles = [
    { label: "Brands in pipeline", value: kpis.brandsTotal },
    { label: "Pitches drafted", value: kpis.pitchesTotal },
    { label: "Proposals drafted", value: kpis.proposalsTotal },
    { label: "Calls booked", value: kpis.callsBooked },
    { label: "Booked rate", value: `${kpis.bookedRate}%` },
  ];

  return (
    <div className="analytics-kpis">
      {tiles.map((t) => (
        <div className="kpi-tile" key={t.label}>
          <div className="kpi-value">{t.value}</div>
          <div className="kpi-label">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
