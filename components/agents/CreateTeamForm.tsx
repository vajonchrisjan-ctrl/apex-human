"use client";

import { useState } from "react";
import { createTeam } from "@/lib/agents/actions";
import type { RosterAgent } from "@/lib/agents/types";

export default function CreateTeamForm({ agents }: { agents: RosterAgent[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleMember(id: string) {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createTeam({ name, description, goal, memberIds });
    setSaving(false);
  }

  return (
    <form
      className="wizard-panel"
      style={{ maxWidth: 560, marginTop: 24 }}
      onSubmit={handleSubmit}
    >
      <label className="field-label">Team name</label>
      <input
        className="field-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Fashion Deals Pod"
        required
      />

      <label className="field-label">Description (optional)</label>
      <input
        className="field-input"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label className="field-label">Goal (optional)</label>
      <textarea
        className="field-input"
        rows={2}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <label className="field-label">Members</label>
      <div className="member-picker">
        {agents.map((a) => (
          <label
            key={a.id}
            className={`capability-option ${
              memberIds.includes(a.id) ? "capability-option-active" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={memberIds.includes(a.id)}
              onChange={() => toggleMember(a.id)}
              style={{ display: "none" }}
            />
            {a.name}
          </label>
        ))}
      </div>

      <div
        className="wizard-actions"
        style={{ justifyContent: "flex-start", gap: 12 }}
      >
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || !memberIds.length || saving}
        >
          {saving ? "Creating…" : "Create team"}
        </button>
      </div>
    </form>
  );
}
