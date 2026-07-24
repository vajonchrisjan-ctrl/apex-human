"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import NotificationsBell from "@/components/app/NotificationsBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🪐" },
  { href: "/deals", label: "Deals", icon: "🤝" },
  { href: "/agents", label: "Agents", icon: "🤖" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || "Your account";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-logo">▲ Agentic Sales Team</div>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-nav-link ${active ? "app-nav-link-active" : ""}`}
              >
                <span className="app-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <input
            className="app-search"
            type="search"
            placeholder="Search brands, agents, deals…"
            aria-label="Search"
          />
          <div className="app-topbar-user">
            <NotificationsBell />
            <span className="app-user-name">{displayName}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
