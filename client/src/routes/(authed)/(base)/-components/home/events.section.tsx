import EventCard from "#/components/eventCard";
import { Skeleton } from "#/components/skeleton/skeleton";
import { useEventsQuery } from "#/data/event.data";
import { useNavigate } from "@tanstack/react-router";
import styles from "#/routes/(authed)/(base)/index.module.css";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <section className={styles.section}>
    <h1 className={styles.heading}>กิจกรรม</h1>
    {children}
  </section>
);

export function EventsSections() {
  const navigate = useNavigate();
  const { data, isLoading } = useEventsQuery();

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.eventsGrid}>
          {Array.from({ length: 3 }).map((_, index) => (
            // oxlint-disable-next-line react/no-array-index-key
            <Skeleton key={`sq-ev-${index}`} height="5rem" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Layout>
        <p>ไม่มีข้อมูลกิจกรรมในตอนนี้</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.eventsGrid}>
        {data.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => navigate({ to: "/event/$eventId", params: { eventId: event.id } })}
          />
        ))}
      </div>
    </Layout>
  );
}

export default EventsSections;
