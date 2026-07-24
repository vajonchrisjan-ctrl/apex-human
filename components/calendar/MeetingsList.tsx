import Link from "next/link";
import type { Meeting } from "@/lib/meetings/types";

function formatGroupLabel(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(meetings: Meeting[]) {
  const groups: { label: string; items: Meeting[] }[] = [];
  for (const m of meetings) {
    const label = formatGroupLabel(m.whenAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(m);
    else groups.push({ label, items: [m] });
  }
  return groups;
}

export default function MeetingsList({ meetings }: { meetings: Meeting[] }) {
  if (!meetings.length) {
    return (
      <p className="body-muted" style={{ fontSize: 13, marginTop: 16 }}>
        No calls booked yet — book one above, or straight from a brand&apos;s
        page.
      </p>
    );
  }

  const groups = groupByDate(meetings);

  return (
    <div className="meetings-list">
      {groups.map((group) => (
        <div className="meetings-group" key={group.label}>
          <p className="meetings-group-label">{group.label}</p>
          <div className="meetings-group-items">
            {group.items.map((m) => (
              <div className="meeting-card" key={m.id}>
                <div className="meeting-card-time">
                  {m.whenAt.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  {m.leadId ? (
                    <Link href={`/deals/${m.leadId}`} className="meeting-card-title">
                      {m.title}
                    </Link>
                  ) : (
                    <span className="meeting-card-title">{m.title}</span>
                  )}
                  <div className="meeting-card-kind">{m.kind}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
