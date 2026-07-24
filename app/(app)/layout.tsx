import { redirect } from "next/navigation";
import AppFrame from "@/components/app/AppFrame";
import { currentUser } from "@/lib/auth/currentUser";
import { isDbConfigured } from "@/lib/db";
import { getCreatorProfile, isProfileComplete } from "@/lib/profile/store";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (user && isDbConfigured()) {
    const profile = await getCreatorProfile(user.userId);
    if (!isProfileComplete(profile)) {
      redirect("/onboarding");
    }
  }

  return <AppFrame>{children}</AppFrame>;
}
