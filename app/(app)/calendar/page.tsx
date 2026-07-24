import { auth } from "@clerk/nextjs/server";
import { listUpcomingMeetings } from "@/lib/meetings/store";
import BookCallForm from "@/components/calendar/BookCallForm";
import MeetingsList from "@/components/calendar/MeetingsList";

export default async function CalendarPage() {
  const { userId } = await auth();
  const meetings = userId ? await listUpcomingMeetings(userId) : [];

  return (
    <div>
      <p className="eyebrow">Calendar</p>
      <h1 className="heading">Your booked calls.</h1>

      <div className="deals-toolbar" style={{ marginTop: 24 }}>
        <BookCallForm />
      </div>

      <MeetingsList meetings={meetings} />
    </div>
  );
}
