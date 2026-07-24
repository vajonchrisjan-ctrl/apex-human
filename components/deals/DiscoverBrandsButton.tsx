"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscoverBrandsButton() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setNotice(null);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: category.trim() }),
    });
    const data = await res.json().catch(() => ({ added: 0 }));
    setNotice(
      data.added > 0
        ? `Found ${data.added} new brand${data.added === 1 ? "" : "s"} — check Pending review below.`
        : "No new brands found this time — try again in a bit."
    );
    setRunning(false);
    router.refresh();
  }

  return (
    <div className="discover-brands-card">
      <div>
        <p className="field-label" style={{ marginTop: 0 }}>
          Let your Research agent search
        </p>
        <p className="body-muted" style={{ fontSize: 13 }}>
          Finds real brands and drops them into Pending review below for your
          OK. Leave the category blank to use your Media Kit niche, or type
          one to search something specific.
        </p>
      </div>
      <div className="discover-brands-actions">
        <input
          className="field-input"
          style={{ maxWidth: 200 }}
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={running}
          type="button"
        >
          {running ? "Searching…" : "🔍 Find brands"}
        </button>
        {notice && (
          <span className="body-muted" style={{ fontSize: 13 }}>
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}
