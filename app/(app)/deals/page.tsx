import { auth } from "@clerk/nextjs/server";
import { listLeads } from "@/lib/deals/store";
import { listAgents } from "@/lib/agents/store";
import AddLeadForm from "@/components/deals/AddLeadForm";
import ImportCsvForm from "@/components/deals/ImportCsvForm";
import DiscoverBrandsButton from "@/components/deals/DiscoverBrandsButton";
import PendingReview from "@/components/deals/PendingReview";
import DealsBoard from "@/components/deals/DealsBoard";

export default async function DealsPage() {
  const { userId } = await auth();
  const [allLeads, roster] = userId
    ? await Promise.all([listLeads(userId), listAgents(userId)])
    : [[], []];

  const pending = allLeads.filter((l) => l.review === "pending");
  const accepted = allLeads.filter((l) => l.review === "accepted");

  return (
    <div>
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Deals</p>
          <h1 className="heading">Your pipeline.</h1>
        </div>
      </div>

      <div className="deals-toolbar">
        <AddLeadForm agents={roster} />
        <ImportCsvForm agents={roster} />
      </div>

      <DiscoverBrandsButton />

      {pending.length > 0 ? (
        <PendingReview leads={pending} />
      ) : (
        <div className="pending-review">
          <p className="eyebrow">Pending review</p>
          <p className="body-muted" style={{ fontSize: 13 }}>
            Brands your agents discover on their own will wait here for your
            approval. Nothing here yet.
          </p>
        </div>
      )}

      <DealsBoard leads={accepted} agents={roster} />
    </div>
  );
}
