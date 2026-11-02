import { getEventQueryOptions } from "#/data/event.data";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import styles from "./eventDetail.module.css";
import { eventDateColorMap } from "#/components/eventCard";
import ButtonLink from "#/components/buttonLink";

export const Route = createFileRoute("/(authed)/(base)/event/$eventId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const event = await context.queryClient.query(getEventQueryOptions(params.eventId));
    return event;
  },
});

const formatTime = (startDate: Date, endDate: Date) => {
  const block = [
    `${startDate.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })} ${startDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`,
  ];
  // is same day
  if (startDate.toDateString() === endDate.toDateString()) {
    block.push(endDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
  } else {
    block.push(
      `${endDate.toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })} ${endDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`,
    );
  }
  return block.join(" - ");
};

function RouteComponent() {
  const event = Route.useLoaderData();
  const date = new Date(event.startAt);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${event.startAt}/${event.endAt}`,
    details: event.description || "",
    location: event.location || "",
  }).toString()}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div
          className={styles.dateBlock}
          style={{ "--date-color": eventDateColorMap[event.type] } as React.CSSProperties}
        >
          <span className={styles.day}>{day}</span>
          <span className={styles.month}>{month}</span>
        </div>
        <div className={styles.card}>
          <h1 className={styles.title}>{event.name}</h1>
          <div className={styles.field}>
            <span className={styles.label}>วันและเวลา</span>
            <span>{formatTime(new Date(event.startAt), new Date(event.endAt))}</span>
          </div>
          {event.speaker && (
            <div className={styles.field}>
              <span className={styles.label}>วิทยากร</span>
              <span>{event.speaker}</span>
            </div>
          )}
          {event.location && (
            <div className={styles.field}>
              <span className={styles.label}>สถานที่</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.description && (
            <div className={styles.field}>
              <span className={styles.label}>รายละเอียด</span>
              <span className={styles.description}>{event.description}</span>
            </div>
          )}
          {event.url && (
            <ButtonLink to={event.url} target="_blank" rel="noreferrer" block size="lg">
              ดูรายละเอียดเพิ่มเติม
            </ButtonLink>
          )}
          <ButtonLink
            to={googleCalendarUrl}
            target="_blank"
            rel="noreferrer"
            block
            variant="secondary"
          >
            เพิ่มลง Google Calendar
          </ButtonLink>

          <ButtonLink to="/" variant="secondary" block>
            <ChevronLeft />
            กลับไปหน้าแรก
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
