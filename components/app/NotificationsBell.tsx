"use client";

import { useEffect, useRef, useState } from "react";
import { dismissNotification, clearAllNotifications } from "@/lib/notifications/actions";

interface Item {
  id: string;
  type: string;
  text: string;
  leadId: string | null;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      // ignore transient poll failures
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleDismiss(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await dismissNotification(id);
  }

  async function handleClearAll() {
    setItems([]);
    await clearAllNotifications();
  }

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-label="Notifications"
      >
        🔔
        {items.length > 0 && <span className="notif-bell-count">{items.length}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Notifications</span>
            {items.length > 0 && (
              <button className="notif-clear-btn" onClick={handleClearAll} type="button">
                Clear all
              </button>
            )}
          </div>
          {items.length === 0 && (
            <p className="body-muted" style={{ fontSize: 13, padding: "12px 16px" }}>
              Nothing new.
            </p>
          )}
          {items.map((i) => (
            <div className="notif-item" key={i.id}>
              <div>
                <p className="notif-item-text">{i.text}</p>
                <p className="notif-item-time">{timeAgo(i.createdAt)}</p>
              </div>
              <button
                className="notif-dismiss-btn"
                onClick={() => handleDismiss(i.id)}
                type="button"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
