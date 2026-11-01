import EventCard, { type CampusEvent } from "#/components/eventCard";
import styles from "#/routes/(authed)/(base)/index.module.css";

const campusMocksEvents: CampusEvent[] = [
  {
    id: "exam",
    day: "31",
    month: "OCT",
    title: "Midterm Exam",
    location: "At DPU",
    dateColor: "var(--color-danger)",
  },
];

function handleEventClick() {
  alert("This feature is not available yet");
}

export function EventsSections() {
  return (
    <section className={styles.section}>
      <h1 className={styles.heading}>กิจกรรม</h1>
      <div className={styles.eventsGrid}>
        {campusMocksEvents.map((event) => (
          <EventCard key={event.id} event={event} onClick={handleEventClick} />
        ))}
      </div>
    </section>
  );
}

export default EventsSections;
