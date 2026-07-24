"use client";

import { useState } from "react";
import { saveCreatorProfile } from "@/lib/profile/actions";
import PlatformRows, { emptyPlatformRow, PlatformRowValue } from "./PlatformRows";
import type { CreatorProfileData } from "@/lib/profile/types";

function toRows(platforms: CreatorProfileData["platforms"]): PlatformRowValue[] {
  if (!platforms.length) return [emptyPlatformRow()];
  return platforms.map((p) => ({
    platform: p.platform,
    handle: p.handle,
    followers: String(p.followers ?? ""),
    engagementRate: String(p.engagementRate ?? ""),
  }));
}

export default function MediaKitEditor({
  profile,
}: {
  profile: CreatorProfileData | null;
}) {
  const [niche, setNiche] = useState(profile?.niche ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [platforms, setPlatforms] = useState<PlatformRowValue[]>(
    toRows(profile?.platforms ?? [])
  );
  const [age, setAge] = useState(profile?.audience?.age ?? "");
  const [geo, setGeo] = useState(profile?.audience?.geo ?? "");
  const [gender, setGender] = useState(profile?.audience?.gender ?? "");
  const [tone, setTone] = useState(profile?.tone ?? "");
  const [pastDeals, setPastDeals] = useState(profile?.pastDeals ?? "");
  const [rateFloor, setRateFloor] = useState(
    profile?.rateFloor != null ? String(profile.rateFloor) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await saveCreatorProfile({
      niche,
      bio,
      platforms: platforms
        .filter((p) => p.platform.trim() && p.handle.trim())
        .map((p) => ({
          platform: p.platform,
          handle: p.handle,
          followers: Number(p.followers) || 0,
          engagementRate: Number(p.engagementRate) || 0,
        })),
      audience: { age, geo, gender },
      tone,
      pastDeals,
      rateFloor: rateFloor.trim() ? Number(rateFloor) : null,
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="media-kit-editor">
      <div className="wizard-panel">
        <label className="field-label">Your niche</label>
        <input
          className="field-input"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. Fitness & wellness for busy parents"
        />

        <label className="field-label">Bio</label>
        <textarea
          className="field-input"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label className="field-label" style={{ marginTop: 20 }}>
          Platforms
        </label>
        <PlatformRows rows={platforms} onChange={setPlatforms} />

        <div className="field-grid" style={{ marginTop: 20 }}>
          <div>
            <label className="field-label">Age range</label>
            <input
              className="field-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Where they&apos;re based</label>
            <input
              className="field-input"
              value={geo}
              onChange={(e) => setGeo(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Gender split</label>
            <input
              className="field-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </div>
        </div>

        <label className="field-label">Tone / vibe</label>
        <input
          className="field-input"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
        />

        <label className="field-label">Past brand deals</label>
        <textarea
          className="field-input"
          rows={3}
          value={pastDeals}
          onChange={(e) => setPastDeals(e.target.value)}
        />

        <label className="field-label">Rate floor ($ per deal)</label>
        <input
          className="field-input"
          type="number"
          min="0"
          value={rateFloor}
          onChange={(e) => setRateFloor(e.target.value)}
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
    </div>
  );
}
