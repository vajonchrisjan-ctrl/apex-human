"use client";

import { useState } from "react";
import { createAgent } from "@/lib/agents/actions";
import { CAPABILITY_LABELS, type CapabilityId } from "@/lib/agentTypes";

const ALL_CAPS = Object.keys(CAPABILITY_LABELS) as CapabilityId[];

export default function CreateAgentForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [caps, setCaps] = useState<CapabilityId[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleCap(c: CapabilityId) {
    setCaps((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createAgent({ name, role, goal, capabilities: caps });
    setSaving(false);
  }

  return (
    <form
      className="wizard-panel"
      style={{ maxWidth: 560, marginTop: 24 }}
      onSubmit={handleSubmit}
    >
      <label className="field-label">Name</label>
      <input
        className="field-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Jordan"
        required
      />

      <label className="field-label">Role</label>
      <input
        className="field-input"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="e.g. Instagram DM specialist"
      />

      <label className="field-label">Goal (optional)</label>
      <textarea
        className="field-input"
        rows={2}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="What should this helper focus on?"
      />

      <label className="field-label">What can they do?</label>
      <div className="capability-picker">
        {ALL_CAPS.map((c) => (
          <label
            key={c}
            className={`capability-option ${
              caps.includes(c) ? "capability-option-active" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={caps.includes(c)}
              onChange={() => toggleCap(c)}
              style={{ display: "none" }}
            />
            {CAPABILITY_LABELS[c]}
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
          disabled={!name.trim() || !caps.length || saving}
        >
          {saving ? "Creating…" : "Create helper"}
        </button>
      </div>
    </form>
  );
}
