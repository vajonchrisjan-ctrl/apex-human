import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getAgent } from "@/lib/agents/store";
import { CAPABILITY_LABELS } from "@/lib/agentTypes";
import EditAgentForm from "@/components/agents/EditAgentForm";

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  const agent = userId ? await getAgent(userId, params.id) : null;
  if (!agent) notFound();

  return (
    <div>
      <p className="eyebrow">{agent.isPreset ? "Preset agent" : "Custom agent"}</p>
      <h1 className="heading">{agent.name}</h1>
      <div className="agent-card-tags" style={{ marginTop: 12 }}>
        {agent.capabilities.map((c) => (
          <span key={c} className="tag">
            {CAPABILITY_LABELS[c]}
          </span>
        ))}
      </div>
      <EditAgentForm agent={agent} />
    </div>
  );
}
