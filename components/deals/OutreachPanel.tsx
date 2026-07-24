"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runOutreach, runFollowup, markDraftSent } from "@/lib/deals/actions";
import type { Lead, OutreachDraft } from "@/lib/deals/types";

function mailtoHref(email: string | null, subject: string | null, body: string) {
  if (!email) return null;
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  params.set("body", body);
  return `mailto:${email}?${params.toString()}`;
}

export default function OutreachPanel({
  lead,
  drafts,
}: {
  lead: Lead;
  drafts: OutreachDraft[];
}) {
  const router = useRouter();
  const [running, setRunning] = useState<"pitch" | "followup" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function pollUntilDone() {
    for (let i = 0; i < 4; i++) {
      const res = await fetch("/api/jobs/run", { method: "POST" });
      const data = await res.json().catch(() => ({ processed: 0 }));
      if (data.processed > 0) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  async function handleDraftPitch() {
    setRunning("pitch");
    setNotice(null);
    await runOutreach(lead.id, lead.agentId);
    await pollUntilDone();
    setRunning(null);
    router.refresh();
  }

  async function handleFollowup() {
    setRunning("followup");
    setNotice(null);
    const result = await runFollowup(lead.id, lead.agentId);
    if (!result?.ok) {
      setNotice("Draft a pitch first — your Follow-up helper needs something to build on.");
      setRunning(null);
      return;
    }
    await pollUntilDone();
    setRunning(null);
    router.refresh();
  }

  async function handleMarkSent(draftId: string) {
    await markDraftSent(draftId, lead.id);
    router.refresh();
  }

  return (
    <div className="research-panel">
      <div className="page-header-row">
        <p className="eyebrow" style={{ marginTop: 0 }}>
          Outreach
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleFollowup}
            disabled={running !== null}
            type="button"
          >
            {running === "followup" ? "Writing…" : "Send follow-up"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDraftPitch}
            disabled={running !== null}
            type="button"
          >
            {running === "pitch"
              ? "Drafting…"
              : drafts.length
              ? "Draft another pitch"
              : "Draft pitch"}
          </button>
        </div>
      </div>

      {notice && (
        <p className="body-muted" style={{ fontSize: 13 }}>
          {notice}
        </p>
      )}

      {drafts.length === 0 && !running && (
        <p className="body-muted" style={{ fontSize: 13 }}>
          No pitch yet — click &quot;Draft pitch&quot; and your Outreach agent
          will write a first-touch {lead.email ? "email" : "DM"} in your
          voice.
        </p>
      )}

      {drafts.length > 0 && (
        <div className="draft-thread">
          {drafts.map((draft, i) => {
            const href = mailtoHref(lead.email, draft.subject, draft.body);
            const label = i === drafts.length - 1 ? "Initial pitch" : "Follow-up";
            return (
              <div className="draft-card" key={draft.id}>
                <div className="draft-card-header">
                  <span className="tag">{label}</span>
                  <span className="draft-card-status">
                    {draft.status === "sent" ? "Sent" : "Draft"}
                  </span>
                </div>
                {draft.subject && <p className="draft-card-subject">{draft.subject}</p>}
                <p className="draft-card-body">{draft.body}</p>
                <div className="draft-card-actions">
                  {href ? (
                    <a className="btn btn-ghost btn-sm" href={href}>
                      Open in mail app
                    </a>
                  ) : (
                    <span className="body-muted" style={{ fontSize: 12 }}>
                      No email on file — copy this as a DM
                    </span>
                  )}
                  {draft.status === "draft" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => handleMarkSent(draft.id)}
                    >
                      Mark as sent
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
