import { auth } from "@clerk/nextjs/server";
import { getCreatorProfile } from "@/lib/profile/store";
import MediaKitEditor from "@/components/profile/MediaKitEditor";

export default async function ProfilePage() {
  const { userId } = await auth();
  const profile = userId ? await getCreatorProfile(userId) : null;

  return (
    <div>
      <p className="eyebrow">Profile</p>
      <h1 className="heading">Your Media Kit</h1>
      <p className="body-muted" style={{ marginTop: 8, maxWidth: 560 }}>
        This is what every AI helper reads before it writes a pitch or a
        proposal — keep it up to date.
      </p>
      <MediaKitEditor profile={profile} />
    </div>
  );
}
