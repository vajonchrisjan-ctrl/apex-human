import type { ChatMessage } from "@/lib/chat/types";
import type { RosterAgent } from "@/lib/agents/types";

export default function ChatThread({
  messages,
  agents,
}: {
  messages: ChatMessage[];
  agents: RosterAgent[];
}) {
  const agentById = new Map(agents.map((a) => [a.id, a]));

  if (!messages.length) {
    return (
      <p className="body-muted" style={{ fontSize: 13, marginTop: 16 }}>
        No messages yet — try typing{" "}
        <span style={{ fontFamily: "var(--font-geist-mono)" }}>
          &quot;@Research find me some fitness brands&quot;
        </span>{" "}
        below.
      </p>
    );
  }

  return (
    <div className="chat-thread">
      {messages.map((m) => {
        const agent = m.agentId ? agentById.get(m.agentId) : null;
        return (
          <div
            key={m.id}
            className={`chat-message ${m.who === "me" ? "chat-message-me" : "chat-message-ai"}`}
          >
            {m.who === "ai" && (
              <div className="chat-message-author">{agent?.name ?? "Team"}</div>
            )}
            <div className="chat-message-text">{m.text}</div>
          </div>
        );
      })}
    </div>
  );
}
