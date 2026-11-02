import clsx from "clsx";
import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./eventCard.module.css";
import type { components } from "#/data/base/openapi";

type CampusEvent = components["schemas"]["Event"];

export interface EventCardProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onClick"> {
  event: CampusEvent;
  onClick?: () => void;
}

export const eventDateColorMap: Record<CampusEvent["type"], string> = {
  EXAM: "#ed5176",
  TALK: "#8855ed",
  OTHER: "var(--color-secondary)",
};

export function EventCard({ event, onClick, className, style, ...props }: EventCardProps) {
  const date = new Date(event.startAt);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(styles.card, className)}
      style={
        {
          ...(event.type ? { "--date-color": eventDateColorMap[event.type] } : {}),
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div className={styles.dateBlock}>
        <span className={styles.day}>{day}</span>
        <span className={styles.month}>{month}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{event.name}</span>
        <span className={styles.location}>{event.location}</span>
      </div>
    </button>
  );
}

export default EventCard;
