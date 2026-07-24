import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { updateNotifications } from "@/lib/settings/actions";

export default async function SettingsPage() {
  const { userId } = await auth();

  let dealActivity = true;
  let weeklySummary = true;

  if (userId && isDbConfigured()) {
    const db = getDb();
    const rows = await db!.select().from(users).where(eq(users.id, userId)).limit(1);
    const notifications =
      (rows[0]?.notifications as Record<string, boolean> | undefined) ?? {};
    dealActivity = notifications.dealActivity ?? true;
    weeklySummary = notifications.weeklySummary ?? true;
  }

  return (
    <div>
      <p className="eyebrow">Settings</p>
      <h1 className="heading">Notifications</h1>

      <form action={updateNotifications} className="settings-form">
        <label className="settings-row">
          <div>
            <div className="settings-row-title">Deal activity</div>
            <div className="settings-row-sub">
              New brands, pitches, and pipeline updates.
            </div>
          </div>
          <span className="toggle">
            <input
              type="checkbox"
              name="dealActivity"
              defaultChecked={dealActivity}
            />
            <span className="toggle-track" />
          </span>
        </label>

        <label className="settings-row">
          <div>
            <div className="settings-row-title">Weekly summary</div>
            <div className="settings-row-sub">
              A recap of what your team did this week.
            </div>
          </div>
          <span className="toggle">
            <input
              type="checkbox"
              name="weeklySummary"
              defaultChecked={weeklySummary}
            />
            <span className="toggle-track" />
          </span>
        </label>

        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>
    </div>
  );
}
