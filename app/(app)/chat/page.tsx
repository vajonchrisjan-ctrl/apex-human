import { auth } from "@clerk/nextjs/server";
import { listMessages } from "@/lib/chat/store";
import { listAgents } from "@/lib/agents/store";
import ChatThread from "@/components/chat/ChatThread";
import ChatInput from "@/components/chat/ChatInput";

export default async function ChatPage() {
  const { userId } = await auth();
  const [msgs, roster] = userId
    ? await Promise.all([listMessages(userId), listAgents(userId)])
    : [[], []];

  return (
    <div>
      <p className="eyebrow">Chat</p>
      <h1 className="heading">Your team, in one thread.</h1>
      <p className="body-muted" style={{ marginTop: 8, maxWidth: 560 }}>
        @mention a teammate and tell them what to do — they&apos;ll actually
        do it and report back here.
      </p>

      <ChatThread messages={msgs} agents={roster} />
      <div style={{ marginTop: 16 }}>
        <ChatInput agents={roster} />
      </div>
    </div>
  );
}
