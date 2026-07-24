"use client";

export interface PlatformRowValue {
  platform: string;
  handle: string;
  followers: string;
  engagementRate: string;
}

export function emptyPlatformRow(): PlatformRowValue {
  return { platform: "", handle: "", followers: "", engagementRate: "" };
}

export default function PlatformRows({
  rows,
  onChange,
}: {
  rows: PlatformRowValue[];
  onChange: (rows: PlatformRowValue[]) => void;
}) {
  function update(i: number, field: keyof PlatformRowValue, value: string) {
    const next = rows.slice();
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  }

  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...rows, emptyPlatformRow()]);
  }

  return (
    <div className="platform-rows">
      {rows.map((row, i) => (
        <div className="platform-row" key={i}>
          <input
            className="field-input"
            placeholder="Platform (e.g. Instagram)"
            value={row.platform}
            onChange={(e) => update(i, "platform", e.target.value)}
          />
          <input
            className="field-input"
            placeholder="Handle (e.g. @yourname)"
            value={row.handle}
            onChange={(e) => update(i, "handle", e.target.value)}
          />
          <input
            className="field-input"
            placeholder="Followers"
            type="number"
            min="0"
            value={row.followers}
            onChange={(e) => update(i, "followers", e.target.value)}
          />
          <input
            className="field-input"
            placeholder="Engagement %"
            type="number"
            min="0"
            step="0.1"
            value={row.engagementRate}
            onChange={(e) => update(i, "engagementRate", e.target.value)}
          />
          {rows.length > 1 && (
            <button
              type="button"
              className="platform-row-remove"
              onClick={() => remove(i)}
              aria-label="Remove platform"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        onClick={add}
        style={{ marginTop: 8, alignSelf: "flex-start" }}
      >
        + Add another platform
      </button>
    </div>
  );
}
