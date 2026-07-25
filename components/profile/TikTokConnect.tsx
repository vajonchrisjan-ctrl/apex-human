import { disconnectSocialAccount } from "@/lib/social/actions";
import type { SocialAccount } from "@/lib/social/store";

export default function TikTokConnect({ account }: { account: SocialAccount | null }) {
  const disconnect = disconnectSocialAccount.bind(null, "tiktok");

  return (
    <div className="research-panel">
      <p className="eyebrow" style={{ marginTop: 0 }}>
        TikTok
      </p>

      {account ? (
        <div className="tiktok-connected">
          {account.avatarUrl && (
            <img src={account.avatarUrl} alt="" className="tiktok-avatar" />
          )}
          <div>
            <div className="tiktok-connected-name">
              {account.displayName || account.username || "Connected"}
            </div>
            <div className="body-muted" style={{ fontSize: 13 }}>
              {account.followerCount != null
                ? `${account.followerCount.toLocaleString()} followers`
                : "Connected"}
            </div>
          </div>
          <form action={disconnect} style={{ marginLeft: "auto" }}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Disconnect
            </button>
          </form>
        </div>
      ) : (
        <>
          <p className="body-muted" style={{ fontSize: 13 }}>
            Connect your TikTok to automatically fill in your follower count
            and put your profile photo at the center of your dashboard.
          </p>
          <a href="/api/auth/tiktok/start" className="btn btn-primary" style={{ marginTop: 12 }}>
            Connect TikTok
          </a>
        </>
      )}
    </div>
  );
}
