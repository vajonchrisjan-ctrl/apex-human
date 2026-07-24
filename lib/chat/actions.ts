"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDb, isDbConfigured } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { listAgents } from "@/lib/agents/store";
import { findMentionedAgent } from "./intent";
import { runChatIntent } from "./orchestrator";

export async function sendChatMessage(text: string) {
  const { userId } = await auth();
  if (!userId || !isDbConfigured()) return;
  if (!text.trim()) return;

  const db = getDb()!;
  const roster = await listAgents(userId);
  const mentionedAgent = findMentionedAgent(text, roster);

  await db.insert(messages).values({
    userId,
    agentId: mentionedAgent?.id ?? null,
    who: "me",
    text: text.trim(),
  });

  if (mentionedAgent) {
    let replyText: string;
    try {
      replyText = await runChatIntent(userId, mentionedAgent, roster, text.trim());
    } catch {
      replyText = "Something went wrong on my end — try that again.";
    }
    await db.insert(messages).values({
      userId,
      agentId: mentionedAgent.id,
      who: "ai",
      text: replyText,
    });
  } else {
    await db.insert(messages).values({
      userId,
      agentId: null,
      who: "ai",
      text: `Mention a teammate to get help — try "@Research find me some fitness brands".`,
    });
  }

  revalidatePath("/chat");
}
