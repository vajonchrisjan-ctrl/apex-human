import OrbitDashboard from "@/components/OrbitDashboard";
import { PRESET_DEAL_TEAM } from "@/lib/agentTypes";

const demoAgents = PRESET_DEAL_TEAM.map((a) => ({
  id: a.id,
  name: a.name,
  initials: a.initials,
  icon: a.icon,
  status: a.demoStatus,
  task: a.demoTask,
  score: a.demoScore,
}));

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <OrbitDashboard agents={demoAgents} />
        <div className="hero-copy">
          <p className="eyebrow">AI-run brand deals</p>
          <h1 className="display">
            Your AI sales team, working your brand deals 24/7.
          </h1>
          <p className="hero-sub">
            Agentic Sales Team finds brands in your niche, pitches them in
            your voice, prices the deal, follows up, and books the call — so
            you don&apos;t have to chase a single lead.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Build your team
            </button>
            <button className="btn btn-ghost" type="button">
              See how it works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
