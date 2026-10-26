import clsx from "clsx";
import type { CSSProperties, HTMLAttributes } from "react";
import styles from "./eventCard.module.css";

export interface CampusEvent {
  id?: string;
  day: string;
  month: string;
  title: string;
  location: string;
  dateColor?: string;
}

export interface EventCardProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onClick"> {
  event: CampusEvent;
  onClick?: () => void;
}

export function EventCard({ event, onClick, className, style, ...props }: EventCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(styles.card, className)}
      style={
        {
          ...(event.dateColor ? { "--date-color": event.dateColor } : {}),
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div className={styles.dateBlock}>
        <span className={styles.day}>{event.day}</span>
        <span className={styles.month}>{event.month}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{event.title}</span>
        <span className={styles.location}>{event.location}</span>
      </div>
    </button>
  );
}

export default EventCard;
