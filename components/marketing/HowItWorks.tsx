const STEPS = [
  {
    n: "01",
    title: "Tell us who you are",
    body: "Fill in your niche, platforms, audience, and rates once — this is what every AI helper grounds its work on.",
  },
  {
    n: "02",
    title: "Your team gets to work",
    body: "Research finds brands, Outreach pitches them, Proposal prices the deal — all in the background.",
  },
  {
    n: "03",
    title: "You approve and send",
    body: "Every pitch and proposal is a draft you review first. Nothing goes out without your say.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <p className="eyebrow">How it works</p>
        <h2 className="heading">Three steps. Your team does the rest.</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="step-number">{s.n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                {s.title}
              </h3>
              <p className="body-muted" style={{ fontSize: 14 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
