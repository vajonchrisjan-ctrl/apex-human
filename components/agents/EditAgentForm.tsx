"use client";

import { useState } from "react";
import { updateAgent } from "@/lib/agents/actions";
import type { RosterAgent } from "@/lib/agents/types";

export default function EditAgentForm({ agent }: { agent: RosterAgent }) {
  const [role, setRole] = useState(agent.role);
  const [goal, setGoal] = useState(agent.goal ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateAgent(agent.id, { role, goal });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="wizard-panel" style={{ maxWidth: 560, marginTop: 24 }}>
      <label className="field-label">Role</label>
      <input
        className="field-input"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <label className="field-label">Goal</label>
      <textarea
        className="field-input"
        rows={3}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <div
        className="wizard-actions"
        style={{ justifyContent: "flex-start", gap: 12 }}
      >
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="body-muted" style={{ fontSize: 13 }}>
            Saved.
          </span>
        )}
      </div>
    </div>
  );
}
