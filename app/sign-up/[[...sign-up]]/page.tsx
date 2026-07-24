import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-paper-white)",
      }}
    >
      <SignUp />
    </main>
  );
}
