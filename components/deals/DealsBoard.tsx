import { LEAD_STAGES } from "@/lib/deals/types";
import type { Lead } from "@/lib/deals/types";
import type { RosterAgent } from "@/lib/agents/types";
import LeadCard from "./LeadCard";

export default function DealsBoard({
  leads,
  agents,
}: {
  leads: Lead[];
  agents: RosterAgent[];
}) {
  const agentById = new Map(agents.map((a) => [a.id, a]));

  return (
    <div className="deals-board">
      {LEAD_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.status === stage.id);
        return (
          <div className="deals-column" key={stage.id}>
            <div className="deals-column-header">
              <span>{stage.label}</span>
              <span className="deals-column-count">{stageLeads.length}</span>
            </div>
            <div className="deals-column-body">
              {stageLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  agent={lead.agentId ? agentById.get(lead.agentId) ?? null : null}
                />
              ))}
              {stageLeads.length === 0 && (
                <div className="deals-column-empty">No brands here yet</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
