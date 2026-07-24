import CreateAgentForm from "@/components/agents/CreateAgentForm";

export default function NewAgentPage() {
  return (
    <div>
      <p className="eyebrow">New agent</p>
      <h1 className="heading">Build a custom helper.</h1>
      <CreateAgentForm />
    </div>
  );
}
