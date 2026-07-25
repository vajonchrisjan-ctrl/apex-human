export const metadata = {
  title: "Terms of Service — Agentic Sales Team",
};

export default function TermsPage() {
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
        Terms of Service
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 15, lineHeight: 1.6, color: "var(--color-charcoal)" }}>
        <p>Last updated: 2026</p>

        <p>
          Agentic Sales Team (&quot;the app&quot;, &quot;we&quot;) is a tool that helps content
          creators manage brand sponsorship deals. By creating an account and using
          the app, you agree to these terms.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          What the app does
        </h2>
        <p>
          The app lets you build a profile of your niche, audience, and rates, and
          uses AI to help discover brands, draft outreach messages, price
          proposals, follow up with brands, and schedule calls. Every message the
          app drafts is a draft only — you review and send it yourself from your
          own email or messaging app. The app never sends anything on your behalf
          without your action.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          Your responsibilities
        </h2>
        <p>
          You&apos;re responsible for the accuracy of the information you provide,
          for reviewing AI-drafted content before sending it, and for your own
          conduct in any brand relationships you pursue through the app.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          No warranty
        </h2>
        <p>
          The app is provided as-is. AI-generated content may contain mistakes —
          always review it before use. We don&apos;t guarantee any particular
          business outcome from using the app.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          Changes
        </h2>
        <p>
          These terms may be updated from time to time as the app changes.
          Continued use of the app after a change means you accept the updated
          terms.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-obsidian)" }}>
          Contact
        </h2>
        <p>Questions about these terms can be sent to the app owner directly.</p>
      </div>
    </main>
  );
}
