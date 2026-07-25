export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { socialAccounts, creatorProfile } from "@/lib/db/schema";
import { encryptToken } from "@/lib/social/tokenCrypto";
import type { PlatformEntry } from "@/lib/profile/types";

interface TikTokUserInfo {
  open_id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  follower_count?: number;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers.get("cookie")?.match(/tiktok_oauth_state=([^;]+)/)?.[1];
  const codeVerifier = request.headers.get("cookie")?.match(/tiktok_oauth_verifier=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState || !codeVerifier) {
    return NextResponse.redirect(new URL("/profile?tiktok=error", request.url));
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/profile?tiktok=not_configured", request.url));
  }

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error("Token exchange failed");
    }

    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url,follower_count",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const userData = await userRes.json();
    const info: TikTokUserInfo = userData?.data?.user ?? {};

    if (isDbConfigured()) {
      const db = getDb()!;
      const encryptedRefresh = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null;
      const snapshot = { followerCount: info.follower_count ?? 0 };

      await db
        .insert(socialAccounts)
        .values({
          userId,
          provider: "tiktok",
          openId: info.open_id ?? null,
          username: info.username ?? null,
          displayName: info.display_name ?? null,
          avatarUrl: info.avatar_url ?? null,
          refreshToken: encryptedRefresh,
          scope: tokenData.scope ?? null,
          snapshot,
          needsReconnect: false,
          connectedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [socialAccounts.userId, socialAccounts.provider],
          set: {
            openId: info.open_id ?? null,
            username: info.username ?? null,
            displayName: info.display_name ?? null,
            avatarUrl: info.avatar_url ?? null,
            refreshToken: encryptedRefresh,
            scope: tokenData.scope ?? null,
            snapshot,
            needsReconnect: false,
            connectedAt: new Date(),
          },
        });

      const profileRows = await db
        .select()
        .from(creatorProfile)
        .where(eq(creatorProfile.userId, userId))
        .limit(1);
      const existing = profileRows[0];
      const platforms = ((existing?.platforms as PlatformEntry[]) ?? []).filter(
        (p) => p.platform?.toLowerCase() !== "tiktok"
      );
      const updatedPlatforms: PlatformEntry[] = [
        ...platforms,
        {
          platform: "TikTok",
          handle: info.username ? `@${info.username}` : info.display_name ?? "",
          followers: info.follower_count ?? 0,
          engagementRate: 0,
        },
      ];

      if (existing) {
        await db
          .update(creatorProfile)
          .set({ platforms: updatedPlatforms, updatedAt: new Date() })
          .where(eq(creatorProfile.userId, userId));
      } else {
        await db.insert(creatorProfile).values({ userId, platforms: updatedPlatforms });
      }
    }

    const res = NextResponse.redirect(new URL("/profile?tiktok=connected", request.url));
    res.cookies.delete("tiktok_oauth_state");
    res.cookies.delete("tiktok_oauth_verifier");
    return res;
  } catch {
    return NextResponse.redirect(new URL("/profile?tiktok=error", request.url));
  }
}
