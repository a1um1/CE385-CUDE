import styles from "./calendar.module.css";

export default function Calendar({
  month,
  year,
  containerClassName,
  activityData,
}: {
  month: number;
  year: number;
  containerClassName?: string;
  activityData?: Record<string, number>;
}) {
  if (month < 1 || month > 12) throw new Error("Month must be between 1 and 12");
  if (year < 0) throw new Error("Year must be a positive number");

  const monthIndex = month - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthString = new Date(year, monthIndex).toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();
  const monthOffset = new Date(year, monthIndex, 1).getDay();

  return (
    <div className={containerClassName}>
      <p className={styles.monthTitle}>
        {monthString}
        {year !== currentYear && ` ${year}`}
      </p>
      <div className={styles.grid}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
        {Array.from({ length: monthOffset }, (_, i) => (
          <div key={`offset-${i}`} className={styles.offsetCell} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => (
          <div
            key={i}
            className={styles.dayCell}
            data-activity={(activityData?.[`${year}-${month}-${i + 1}`] ?? 0) * 100}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
