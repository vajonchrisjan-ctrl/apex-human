import MediaKitWizard from "@/components/profile/MediaKitWizard";

export default function OnboardingPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--color-paper-white)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <MediaKitWizard />
    </main>
  );
}
