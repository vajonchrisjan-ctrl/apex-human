"use client";

import { useRef, useState } from "react";
import { importLeadsCsv } from "@/lib/deals/actions";
import type { RosterAgent } from "@/lib/agents/types";

export default function ImportCsvForm({ agents }: { agents: RosterAgent[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [agentId, setAgentId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setStatus(null);
    const text = await file.text();
    const result = await importLeadsCsv(text, agentId);
    setStatus(`Imported ${result.count} brand${result.count === 1 ? "" : "s"}.`);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="import-csv-form">
      <p className="field-label" style={{ marginTop: 0 }}>
        Or import a list
      </p>
      <div className="import-csv-form-row">
        <select
          className="field-input"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <label className="btn btn-ghost" style={{ cursor: "pointer" }}>
          {importing ? "Importing…" : "Import CSV"}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            style={{ display: "none" }}
            disabled={importing}
          />
        </label>
        {status && (
          <span className="body-muted" style={{ fontSize: 13 }}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
