"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCreatorProfile } from "@/lib/profile/actions";
import PlatformRows, { emptyPlatformRow, PlatformRowValue } from "./PlatformRows";

const STEPS = [
  "Your niche",
  "Your platforms",
  "Your audience & voice",
  "Past deals & rate",
];

export default function MediaKitWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [niche, setNiche] = useState("");
  const [bio, setBio] = useState("");
  const [platforms, setPlatforms] = useState<PlatformRowValue[]>([
    emptyPlatformRow(),
  ]);
  const [age, setAge] = useState("");
  const [geo, setGeo] = useState("");
  const [gender, setGender] = useState("");
  const [tone, setTone] = useState("");
  const [pastDeals, setPastDeals] = useState("");
  const [rateFloor, setRateFloor] = useState("");

  const canProceedStep0 = niche.trim().length > 0;
  const canProceedStep1 = platforms.some(
    (p) => p.platform.trim() && p.handle.trim() && p.followers.trim()
  );
  const canFinish = rateFloor.trim().length > 0;

  async function handleFinish() {
    setSaving(true);
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
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="wizard">
      <div className="wizard-progress">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`wizard-step-dot ${
              i <= step ? "wizard-step-dot-active" : ""
            }`}
          />
        ))}
      </div>
      <p className="eyebrow">
        Step {step + 1} of {STEPS.length}
      </p>

      {step === 0 && (
        <div className="wizard-panel">
          <h1 className="heading">What kind of content do you make?</h1>
          <p className="body-muted">
            This is what your AI team uses to find the right brands.
          </p>
          <label className="field-label">Your niche</label>
          <input
            className="field-input"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Fitness & wellness for busy parents"
          />
          <label className="field-label">A short bio (optional)</label>
          <textarea
            className="field-input"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A couple of sentences about you and your content."
          />
        </div>
      )}

      {step === 1 && (
        <div className="wizard-panel">
          <h1 className="heading">Where do people find you?</h1>
          <p className="body-muted">
            Add each platform you post on, with your follower count.
          </p>
          <PlatformRows rows={platforms} onChange={setPlatforms} />
        </div>
      )}

      {step === 2 && (
        <div className="wizard-panel">
          <h1 className="heading">
            Who&apos;s your audience, and what&apos;s your vibe?
          </h1>
          <div className="field-grid">
            <div>
              <label className="field-label">Age range</label>
              <input
                className="field-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25–34"
              />
            </div>
            <div>
              <label className="field-label">Where they&apos;re based</label>
              <input
                className="field-input"
                value={geo}
                onChange={(e) => setGeo(e.target.value)}
                placeholder="e.g. Mostly US & UK"
              />
            </div>
            <div>
              <label className="field-label">Gender split</label>
              <input
                className="field-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="e.g. 70% women"
              />
            </div>
          </div>
          <label className="field-label">Your tone / vibe</label>
          <input
            className="field-input"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="e.g. Warm, funny, no-nonsense"
          />
        </div>
      )}

      {step === 3 && (
        <div className="wizard-panel">
          <h1 className="heading">Deals you&apos;ve done, and your rate</h1>
          <label className="field-label">Past brand deals (optional)</label>
          <textarea
            className="field-input"
            rows={3}
            value={pastDeals}
            onChange={(e) => setPastDeals(e.target.value)}
            placeholder="Brands you've worked with before, and what you did for them."
          />
          <label className="field-label">Your rate floor ($ per deal)</label>
          <input
            className="field-input"
            type="number"
            min="0"
            value={rateFloor}
            onChange={(e) => setRateFloor(e.target.value)}
            placeholder="e.g. 500"
          />
          <p className="body-muted" style={{ fontSize: 13, marginTop: 8 }}>
            The lowest you&apos;ll accept for a typical deal — your team will
            never price below this.
          </p>
        </div>
      )}

      <div className="wizard-actions">
        {step > 0 ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              (step === 0 && !canProceedStep0) ||
              (step === 1 && !canProceedStep1)
            }
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
          </button>
        )}

        {step === STEPS.length - 1 && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canFinish || saving}
            onClick={handleFinish}
          >
            {saving ? "Saving…" : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}
