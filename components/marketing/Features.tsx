const FEATURES = [
  {
    icon: "🔍",
    title: "Finds brands",
    body: "Your Research agent discovers brands that sponsor creators in your niche and lines them up for review.",
  },
  {
    icon: "✉️",
    title: "Pitches in your voice",
    body: "A personalized first-touch email or DM, written the way you actually talk — never as an AI, never generic.",
  },
  {
    icon: "📄",
    title: "Prices the deal",
    body: "A scoped, priced proposal grounded in your own rates, audience, and platforms — no guesswork.",
  },
  {
    icon: "🔁",
    title: "Stays in touch",
    body: "Brands that go quiet get a warm, on-brand follow-up instead of falling through the cracks.",
  },
  {
    icon: "📅",
    title: "Books the call",
    body: "Say when you're free in plain language and the call lands straight on your calendar.",
  },
  {
    icon: "👁",
    title: "Watch it happen live",
    body: "The dashboard shows your whole team at work in real time — who's doing what, right now.",
  },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <p className="eyebrow">What your team does</p>
        <h2 className="heading">Every stage of a brand deal, covered.</h2>
        <div className="grid-3" style={{ marginTop: 40 }}>
          {FEATURES.map((f) => (
            <div className="card" key={f.title}>
              <div className="card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
