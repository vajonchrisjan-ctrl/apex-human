import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function TopNav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="nav-logo">▲ Agentic Sales Team</div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#who-its-for">Who it&apos;s for</a>
        </nav>
        <div className="nav-actions">
          <SignedOut>
            <Link href="/sign-in" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Sign up
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-ghost">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
