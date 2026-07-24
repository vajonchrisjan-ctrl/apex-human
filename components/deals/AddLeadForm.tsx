"use client";

import { useState } from "react";
import { addLead } from "@/lib/deals/actions";
import type { RosterAgent } from "@/lib/agents/types";

export default function AddLeadForm({ agents }: { agents: RosterAgent[] }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [agentId, setAgentId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await addLead({ name, title: "", company, email, platform, agentId });
    setName("");
    setCompany("");
    setEmail("");
    setPlatform("");
    setSaving(false);
  }

  return (
    <form className="add-lead-form" onSubmit={handleSubmit}>
      <p className="field-label" style={{ marginTop: 0 }}>
        Add a brand
      </p>
      <div className="add-lead-form-row">
        <input
          className="field-input"
          placeholder="Brand or contact name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="field-input"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="field-input"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="field-input"
          placeholder="Platform (optional)"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        />
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || saving}
        >
          {saving ? "Adding…" : "+ Add brand"}
        </button>
      </div>
    </form>
  );
}
