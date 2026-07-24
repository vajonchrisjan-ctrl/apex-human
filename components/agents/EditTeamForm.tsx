"use client";

import { useState } from "react";
import { updateTeam } from "@/lib/agents/actions";
import type { RosterAgent, RosterTeam } from "@/lib/agents/types";

export default function EditTeamForm({
  team,
  agents,
}: {
  team: RosterTeam;
  agents: RosterAgent[];
}) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? "");
  const [goal, setGoal] = useState(team.goal ?? "");
  const [memberIds, setMemberIds] = useState<string[]>(team.memberIds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleMember(id: string) {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateTeam(team.id, { name, description, goal, memberIds });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="wizard-panel" style={{ maxWidth: 560, marginTop: 24 }}>
      {!team.isPreset && (
        <>
          <label className="field-label">Team name</label>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="field-label">Description</label>
          <input
            className="field-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="field-label">Goal</label>
          <textarea
            className="field-input"
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </>
      )}

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
          type="button"
          className="btn btn-primary"
          disabled={!memberIds.length || saving}
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
