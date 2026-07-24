import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { listAgents, listTeams } from "@/lib/agents/store";
import AgentCard from "@/components/agents/AgentCard";
import TeamCard from "@/components/agents/TeamCard";

export default async function AgentsPage() {
  const { userId } = await auth();
  const [roster, teamRoster] = userId
    ? await Promise.all([listAgents(userId), listTeams(userId)])
    : [[], []];

  return (
    <div>
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Agents</p>
          <h1 className="heading">Your AI team.</h1>
        </div>
        <Link href="/agents/new" className="btn btn-primary">
          + New agent
        </Link>
      </div>

      <div className="agent-grid">
        {roster.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      <div className="page-header-row" style={{ marginTop: 48 }}>
        <div>
          <p className="eyebrow">Teams</p>
          <h2 className="heading" style={{ fontSize: 24 }}>
            Pods that work together.
          </h2>
        </div>
        <Link href="/agents/teams/new" className="btn btn-primary">
          + New team
        </Link>
      </div>

      <div className="team-grid">
        {teamRoster.map((team) => (
          <TeamCard key={team.id} team={team} agents={roster} />
        ))}
      </div>
    </div>
  );
}
