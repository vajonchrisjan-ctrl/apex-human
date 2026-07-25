export const metadata = {
  title: "Privacy Policy — Agentic Sales Team",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "64px 24px",
        color: "var(--color-obsidian)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <p className="eyebrow">Legal</p>
      <h1 className="heading" style={{ marginBottom: 24 }}>
        Privacy Policy
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 15, lineHeight: 1.6, color: "var(--color-charcoal)" }}>
        <p>Last updated: 2026</p>

        <p>
          This policy explains what information Agentic Sales Team collects and
          how it&apos;s used.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          What we collect
        </h2>
        <p>
          Your account details (via our sign-in provider, Clerk), the profile
          information you enter (niche, audience, rates, platforms), the brands
          and deal information you add or that our AI discovers, and — if you
          choose to connect it — your TikTok profile photo and follower count.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          How it&apos;s used
        </h2>
        <p>
          Your profile information is used only to personalize what our AI
          helpers write for you (pitches, proposals, briefs, follow-ups) and to
          show your own dashboard. Connected social account data (like TikTok
          follower counts) is used only to fill in your own profile and to show
          your own photo on your own dashboard — it is never shared with brands,
          sold, or shown to any other user.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          Where it&apos;s stored
        </h2>
        <p>
          Data is stored in a private database tied to your account. Access
          tokens for connected accounts (like TikTok) are encrypted before
          they&apos;re stored and are never sent to your browser.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          Third parties
        </h2>
        <p>
          We use a small number of service providers to run the app: a sign-in
          provider (Clerk), an AI provider (Google Gemini) to draft content, a
          web-search provider (Firecrawl) for brand discovery, and, if you
          connect it, TikTok&apos;s Login Kit. Each only receives the minimum
          data needed to do its job.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          Your control
        </h2>
        <p>
          You can disconnect a connected social account at any time from your
          Profile page. Contact the app owner to request deletion of your data.
        </p>
      </div>
    </main>
  );
}
