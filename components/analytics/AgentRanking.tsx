import type { AgentRankingRow } from "@/lib/analytics/types";

export default function AgentRanking({ rows }: { rows: AgentRankingRow[] }) {
  const maxCount = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="analytics-ranking">
      <p className="field-label" style={{ marginTop: 0 }}>
        Output by helper
      </p>
      <div className="ranking-list">
        {rows.map((r) => (
          <div className="ranking-row" key={r.agentId}>
            <div className="ranking-avatar">{r.initials}</div>
            <div className="ranking-body">
              <div className="ranking-top">
                <span className="ranking-name">{r.name}</span>
                <span className="ranking-count">{r.count}</span>
              </div>
              <div className="ranking-bar-track">
                <div
                  className="ranking-bar-fill"
                  style={{ width: `${(r.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
