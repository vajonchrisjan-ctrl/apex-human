import type { DailyActivityPoint } from "@/lib/analytics/types";

export default function ActivityChart({ days }: { days: DailyActivityPoint[] }) {
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="analytics-chart">
      <p className="field-label" style={{ marginTop: 0 }}>
        Activity, last 14 days
      </p>
      <div className="chart-bars">
        {days.map((d) => (
          <div className="chart-bar-col" key={d.date} title={`${d.label}: ${d.count}`}>
            <div className="chart-bar-track">
              <div
                className="chart-bar-fill"
                style={{ height: `${(d.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="chart-bar-label">{d.label.split(" ")[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
