import { formatRelative } from "date-fns";
import { th } from "date-fns/locale";
export default function formatRelativeTime(date: Date | string | number): string {
  return formatRelative(date, new Date(), { locale: th });
}
