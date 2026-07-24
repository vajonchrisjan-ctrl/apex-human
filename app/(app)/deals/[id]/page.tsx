import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getLead, listOutreachDrafts, listProposals } from "@/lib/deals/store";
import { listAgents } from "@/lib/agents/store";
import ResearchPanel from "@/components/deals/ResearchPanel";
import OutreachPanel from "@/components/deals/OutreachPanel";
import ProposalPanel from "@/components/deals/ProposalPanel";
import BookCallPanel from "@/components/deals/BookCallPanel";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  const [lead, roster] = await Promise.all([
    getLead(userId, params.id),
    listAgents(userId),
  ]);
  if (!lead) notFound();

  const [drafts, proposalList] = await Promise.all([
    listOutreachDrafts(userId, lead.id),
    listProposals(userId, lead.id),
  ]);

  const agent = lead.agentId ? roster.find((a) => a.id === lead.agentId) ?? null : null;

  return (
    <div>
      <p className="eyebrow">Brand</p>
      <h1 className="heading">{lead.name}</h1>
      <div className="lead-detail-meta">
        {lead.company && <span>{lead.company}</span>}
        {lead.platform && <span>{lead.platform}</span>}
        {lead.email && <span>{lead.email}</span>}
        {agent && <span>Assigned to {agent.name}</span>}
      </div>

      <ResearchPanel lead={lead} />
      <OutreachPanel lead={lead} drafts={drafts} />
      <ProposalPanel lead={lead} proposals={proposalList} />
      <BookCallPanel leadId={lead.id} />
    </div>
  );
}
