import EventCard, { type CampusEvent } from "#/components/eventCard";

const campusMocksEvents: CampusEvent[] = [
  {
    id: "exam",
    day: "31",
    month: "OCT",
    title: "Midterm Exam",
    location: "At DPU",
    dateColor: "#ffaeae",
  },
];

function handleEventClick() {
  alert("This feature is not available yet");
}

export function EventsSections() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">กิจกรรม</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campusMocksEvents.map((event) => (
          <EventCard key={event.id} event={event} onClick={handleEventClick} />
        ))}
      </div>
    </section>
  );
}

export default EventsSections;
