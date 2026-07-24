import "server-only";
import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function currentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  if (isDbConfigured()) {
    const db = getDb();
    const clerkUser = await clerkCurrentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
    const name = clerkUser?.fullName ?? clerkUser?.username ?? null;

    await db
      ?.insert(users)
      .values({ id: userId, email, name })
      .onConflictDoUpdate({
        target: users.id,
        set: { email, name },
      });
  }

  return { userId };
}
