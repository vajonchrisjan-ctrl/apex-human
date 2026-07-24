import { auth } from "@clerk/nextjs/server";
import { listAgents } from "@/lib/agents/store";
import CreateTeamForm from "@/components/agents/CreateTeamForm";

export default async function NewTeamPage() {
  const { userId } = await auth();
  const roster = userId ? await listAgents(userId) : [];

  return (
    <div>
      <p className="eyebrow">New team</p>
      <h1 className="heading">Group your helpers into a pod.</h1>
      <CreateTeamForm agents={roster} />
    </div>
  );
}
