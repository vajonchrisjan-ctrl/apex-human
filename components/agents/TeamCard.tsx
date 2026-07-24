import Link from "next/link";
import type { RosterAgent, RosterTeam } from "@/lib/agents/types";

export default function TeamCard({
  team,
  agents,
}: {
  team: RosterTeam;
  agents: RosterAgent[];
}) {
  const members = team.memberIds
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean) as RosterAgent[];

  return (
    <Link href={`/agents/teams/${team.id}`} className="team-card">
      <div className="team-card-icon">{team.icon}</div>
      <div className="team-card-name">{team.name}</div>
      {team.description && <p className="team-card-desc">{team.description}</p>}
      <div className="team-card-members">
        {members.map((m) => (
          <span key={m.id} className="team-member-chip" title={m.name}>
            {m.initials}
          </span>
        ))}
      </div>
    </Link>
  );
}
