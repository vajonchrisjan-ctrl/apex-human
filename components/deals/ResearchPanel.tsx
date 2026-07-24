"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runResearch } from "@/lib/deals/actions";
import type { Lead } from "@/lib/deals/types";

export default function ResearchPanel({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    await runResearch(lead.id, lead.agentId);

    for (let i = 0; i < 4; i++) {
      const res = await fetch("/api/jobs/run", { method: "POST" });
      const data = await res.json().catch(() => ({ processed: 0 }));
      if (data.processed > 0) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    setRunning(false);
    router.refresh();
  }

  return (
    <div className="research-panel">
      <div className="page-header-row">
        <p className="eyebrow" style={{ marginTop: 0 }}>
          Brand brief
        </p>
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={running}
          type="button"
        >
          {running ? "Writing brief…" : lead.research ? "Re-run brief" : "Write brief"}
        </button>
      </div>

      {!lead.research && !running && (
        <p className="body-muted" style={{ fontSize: 13 }}>
          No brief yet — click &quot;Write brief&quot; and your Research agent
          will look into what this brand cares about and the best angle to
          pitch them.
        </p>
      )}

      {lead.research && (
        <div className="research-brief">
          <div className="research-brief-block">
            <p className="field-label" style={{ marginTop: 0 }}>
              Summary
            </p>
            <p>{lead.research.summary}</p>
          </div>

          <div className="research-brief-block">
            <p className="field-label">What they care about</p>
            <ul>
              {lead.research.priorities.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="research-brief-block">
            <p className="field-label">Hooks to use</p>
            <ul>
              {lead.research.hooks.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          <div className="research-brief-block">
            <p className="field-label">Best angle</p>
            <p>{lead.research.angle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
