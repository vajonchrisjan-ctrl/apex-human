"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runProposal, markProposalSent } from "@/lib/deals/actions";
import type { Lead, Proposal } from "@/lib/deals/types";

export default function ProposalPanel({
  lead,
  proposals,
}: {
  lead: Lead;
  proposals: Proposal[];
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    await runProposal(lead.id, lead.agentId);
    for (let i = 0; i < 4; i++) {
      const res = await fetch("/api/jobs/run", { method: "POST" });
      const data = await res.json().catch(() => ({ processed: 0 }));
      if (data.processed > 0) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    setRunning(false);
    router.refresh();
  }

  async function handleMarkSent(id: string) {
    await markProposalSent(id, lead.id);
    router.refresh();
  }

  return (
    <div className="research-panel">
      <div className="page-header-row">
        <p className="eyebrow" style={{ marginTop: 0 }}>
          Proposals
        </p>
        <button className="btn btn-primary" onClick={handleRun} disabled={running} type="button">
          {running ? "Drafting…" : proposals.length ? "Draft another proposal" : "Draft proposal"}
        </button>
      </div>

      {proposals.length === 0 && !running && (
        <p className="body-muted" style={{ fontSize: 13 }}>
          No proposal yet — click &quot;Draft proposal&quot; for a scoped,
          priced package based on your Media Kit and rates.
        </p>
      )}

      {proposals.map((p) => (
        <div className="draft-card" key={p.id} style={{ marginTop: 16 }}>
          <div className="draft-card-header">
            <span className="draft-card-status">{p.status === "sent" ? "Sent" : "Draft"}</span>
          </div>
          <p className="draft-card-subject">{p.title}</p>
          <p className="draft-card-body">{p.body}</p>
          {p.packages.length > 0 && (
            <ul className="proposal-packages">
              {p.packages.map((pkg, i) => (
                <li key={i}>{pkg}</li>
              ))}
            </ul>
          )}
          {p.status === "draft" && (
            <div className="draft-card-actions">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => handleMarkSent(p.id)}
              >
                Mark as sent
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
