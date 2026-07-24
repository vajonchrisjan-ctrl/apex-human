export default function Cta() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-panel">
          <h2 className="heading">Ready to build your team?</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16 }}>
            Set up your profile once, and let your AI sales team take it from
            there.
          </p>
          <div className="hero-actions">
            <button
              className="btn"
              type="button"
              style={{ background: "#ffffff", color: "#171717" }}
            >
              Sign up free
            </button>
            <button className="btn btn-ghost" type="button">
              Log in
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
