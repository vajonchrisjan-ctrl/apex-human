import Link from "next/link";
import { setAgentPaused, removeAgent } from "@/lib/agents/actions";
import { CAPABILITY_LABELS } from "@/lib/agentTypes";
import type { RosterAgent } from "@/lib/agents/types";

export default function AgentCard({ agent }: { agent: RosterAgent }) {
  const togglePaused = setAgentPaused.bind(
    null,
    agent.id,
    agent.status !== "paused"
  );
  const remove = removeAgent.bind(null, agent.id);

  return (
    <div className="agent-card">
      <div className="agent-card-top">
        <div className="agent-card-avatar">{agent.initials}</div>
        <div>
          <div className="agent-card-name">{agent.name}</div>
          <div className="agent-card-role">{agent.role}</div>
        </div>
      </div>

      <div className="agent-card-tags">
        {agent.capabilities.map((c) => (
          <span key={c} className="tag">
            {CAPABILITY_LABELS[c]}
          </span>
        ))}
      </div>

      {agent.goal && <p className="agent-card-goal">{agent.goal}</p>}

      <div className="agent-card-actions">
        <Link href={`/agents/${agent.id}`} className="btn btn-ghost btn-sm">
          View
        </Link>
        <form action={togglePaused}>
          <button type="submit" className="btn btn-ghost btn-sm">
            {agent.status === "paused" ? "Resume" : "Pause"}
          </button>
        </form>
        <form action={remove}>
          <button type="submit" className="btn btn-ghost btn-sm">
            Remove
          </button>
        </form>
      </div>
    </div>
  );
}
