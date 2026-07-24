"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookMeetingFromText } from "@/lib/meetings/actions";

export default function BookCallPanel({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setNotice(null);
    const result = await bookMeetingFromText(text.trim(), leadId);
    if (result?.ok) {
      setNotice(`Booked for ${result.whenLabel} — see it on your Calendar.`);
      setText("");
      router.refresh();
    } else {
      setNotice("Couldn't book that — try rephrasing the time.");
    }
    setSaving(false);
  }

  return (
    <div className="research-panel">
      <p className="eyebrow" style={{ marginTop: 0 }}>
        Book a call
      </p>
      <form className="book-call-form-row" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <input
          className="field-input"
          placeholder='e.g. "next Tuesday at 2pm"'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!text.trim() || saving}>
          {saving ? "Booking…" : "Book"}
        </button>
      </form>
      {notice && (
        <p className="body-muted" style={{ fontSize: 13, marginTop: 8 }}>
          {notice}
        </p>
      )}
    </div>
  );
}
