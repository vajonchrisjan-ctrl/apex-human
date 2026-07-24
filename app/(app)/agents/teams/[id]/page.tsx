import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getTeam, listAgents } from "@/lib/agents/store";
import EditTeamForm from "@/components/agents/EditTeamForm";

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  const [team, roster] = await Promise.all([
    getTeam(userId, params.id),
    listAgents(userId),
  ]);
  if (!team) notFound();

  return (
    <div>
      <p className="eyebrow">{team.isPreset ? "Preset team" : "Custom team"}</p>
      <h1 className="heading">{team.name}</h1>
      {team.description && (
        <p className="body-muted" style={{ marginTop: 8 }}>
          {team.description}
        </p>
      )}
      <EditTeamForm team={team} agents={roster} />
    </div>
  );
}
