import { getEventQueryOptions } from "#/data/event.data";
import formatDateTime from "#/lib/dateTime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import styles from "./eventDetail.module.css";
import { eventDateColorMap } from "#/components/eventCard";

export const Route = createFileRoute("/(authed)/(base)/event/$eventId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const event = await context.queryClient.query(getEventQueryOptions(params.eventId));
    return event;
  },
});

function RouteComponent() {
  const event = Route.useLoaderData();
  const date = new Date(event.startAt);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        <ChevronLeft />
        กลับไปยังหน้าแรก
      </Link>

      <div className={styles.header}>
        <div
          className={styles.dateBlock}
          style={{ "--date-color": eventDateColorMap[event.type] } as React.CSSProperties}
        >
          <span className={styles.day}>{day}</span>
          <span className={styles.month}>{month}</span>
        </div>
        <h1 className={styles.title}>{event.name}</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>เริ่ม</span>
          <span>{formatDateTime(event.startAt)}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>สิ้นสุด</span>
          <span>{formatDateTime(event.endAt)}</span>
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
          <div className={styles.field}>
            <span className={styles.label}>ลิงก์</span>
            <a href={event.url} target="_blank" rel="noreferrer">
              {event.url}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
