"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookMeetingFromText } from "@/lib/meetings/actions";

export default function BookCallForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setNotice(null);
    const result = await bookMeetingFromText(text.trim());
    if (result?.ok) {
      setNotice(`Booked: ${result.title} — ${result.whenLabel}`);
      setText("");
      router.refresh();
    } else {
      setNotice("Couldn't book that — try rephrasing.");
    }
    setSaving(false);
  }

  return (
    <form className="book-call-form" onSubmit={handleSubmit}>
      <p className="field-label" style={{ marginTop: 0 }}>
        Book a call
      </p>
      <div className="book-call-form-row">
        <input
          className="field-input"
          placeholder='e.g. "book a call with Acme next Tuesday at 2pm"'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!text.trim() || saving}>
          {saving ? "Booking…" : "Book"}
        </button>
      </div>
      {notice && (
        <p className="body-muted" style={{ fontSize: 13, marginTop: 8 }}>
          {notice}
        </p>
      )}
    </form>
  );
}
