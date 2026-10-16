import { formatDuration, intervalToDuration, type Duration } from "date-fns";
import { th } from "date-fns/locale";

const units: (keyof Duration)[] = ["years", "months", "days", "hours", "minutes", "seconds"];

/** The biggest unit of the time between two moments, e.g. `1 ชั่วโมง` for 1h 35m. */
export default function formatElapsedTime(start: string | Date, end: string | Date): string {
  const duration = intervalToDuration({ start: new Date(start), end: new Date(end) });
  const unit = units.find((key) => duration[key]) ?? "seconds";
  return formatDuration(duration, { locale: th, format: [unit] }) || "0 วินาที";
}
