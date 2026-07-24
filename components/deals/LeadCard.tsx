"use client";

import Link from "next/link";
import { setLeadStage } from "@/lib/deals/actions";
import { LEAD_STAGES } from "@/lib/deals/types";
import type { Lead, LeadStatus } from "@/lib/deals/types";
import type { RosterAgent } from "@/lib/agents/types";

export default function LeadCard({
  lead,
  agent,
}: {
  lead: Lead;
  agent: RosterAgent | null;
}) {
  async function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await setLeadStage(lead.id, e.target.value as LeadStatus);
  }

  return (
    <div className="lead-card">
      <Link href={`/deals/${lead.id}`} className="lead-card-name">
        {lead.name}
      </Link>
      {lead.company && <div className="lead-card-company">{lead.company}</div>}
      {agent && <div className="lead-card-agent">{agent.name}</div>}
      <select
        className="lead-card-stage"
        value={lead.status}
        onChange={handleStageChange}
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
