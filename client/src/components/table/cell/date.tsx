import { EmptyCell } from "#/components/table/cell/empty";
import formatRelativeTime from "#/lib/relativeTime";

export type DateFormatPreset = "date" | "datetime" | "time" | "relative";

export interface DateFormatOptions {
  format?: DateFormatPreset | Intl.DateTimeFormatOptions;
  fallback?: React.ReactNode;
}

export function renderDateCell(value: unknown, options: DateFormatOptions = {}): React.ReactNode {
  if (!value) return options.fallback ?? <EmptyCell />;

  const date = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return options.fallback ?? <EmptyCell />;

  const format = options.format ?? "date";

  if (format === "relative") return formatRelativeTime(date);

  let intlOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (typeof format === "object") {
    intlOptions = format;
  } else if (format === "datetime") {
    intlOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
  } else if (format === "time") {
    intlOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
  }

  return new Intl.DateTimeFormat("th-TH", intlOptions).format(date);
}
