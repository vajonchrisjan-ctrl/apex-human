import { auth } from "@clerk/nextjs/server";
import { getCreatorProfile } from "@/lib/profile/store";
import { getSocialAccount } from "@/lib/social/store";
import MediaKitEditor from "@/components/profile/MediaKitEditor";
import TikTokConnect from "@/components/profile/TikTokConnect";

export default async function ProfilePage() {
  const { userId } = await auth();
  const [profile, tiktok] = userId
    ? await Promise.all([getCreatorProfile(userId), getSocialAccount(userId, "tiktok")])
    : [null, null];

  return (
    <div>
      <p className="eyebrow">Profile</p>
      <h1 className="heading">Your Media Kit</h1>
      <p className="body-muted" style={{ marginTop: 8, maxWidth: 560 }}>
        This is what every AI helper reads before it writes a pitch or a
        proposal — keep it up to date.
      </p>

      <TikTokConnect account={tiktok} />
      <MediaKitEditor profile={profile} />
    </div>
  );
}
