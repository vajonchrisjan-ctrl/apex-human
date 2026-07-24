import { acceptLead, rejectLead } from "@/lib/deals/actions";
import type { Lead } from "@/lib/deals/types";

export default function PendingReview({ leads }: { leads: Lead[] }) {
  return (
    <div className="pending-review">
      <p className="eyebrow">Pending review ({leads.length})</p>
      <div className="pending-list">
        {leads.map((lead) => {
          const accept = acceptLead.bind(null, lead.id);
          const reject = rejectLead.bind(null, lead.id);
          return (
            <div className="pending-card" key={lead.id}>
              <div>
                <div className="pending-card-name">{lead.name}</div>
                {lead.company && (
                  <div className="pending-card-company">{lead.company}</div>
                )}
              </div>
              <div className="pending-card-actions">
                <form action={accept}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Accept
                  </button>
                </form>
                <form action={reject}>
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
