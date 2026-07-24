"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage } from "@/lib/chat/actions";
import type { RosterAgent } from "@/lib/agents/types";

export default function ChatInput({ agents }: { agents: RosterAgent[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const toSend = text.trim();
    setText("");
    await sendChatMessage(toSend);
    setSending(false);
    router.refresh();
  }

  return (
    <div>
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          className="field-input"
          placeholder='@Research find me some fitness brands'
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      <div className="chat-mention-hints">
        {agents.map((a) => (
          <span key={a.id} className="tag" title={a.name}>
            @{a.role}
          </span>
        ))}
      </div>
    </div>
  );
}
