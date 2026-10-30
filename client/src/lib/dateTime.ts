import { format } from "date-fns";
import { th } from "date-fns/locale";

/** Absolute date and time, e.g. `11 ต.ค. 2026 14:30`. */
export default function formatDateTime(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy HH:mm", { locale: th });
}
