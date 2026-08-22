import * as React from "react";
import { Check, X } from "lucide-react";
import Badge from "../badge";

export interface TextFormatOptions {
  fallback?: React.ReactNode;
  strong?: boolean;
  truncate?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export interface NumberFormatOptions {
  locale?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  fallback?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  fallback?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export type DateFormatPreset = "date" | "datetime" | "time" | "relative";

export interface DateFormatOptions {
  format?: DateFormatPreset | Intl.DateTimeFormatOptions;
  locale?: string;
  fallback?: React.ReactNode;
}

export interface BadgeMapItem {
  color?: string;
  label?: React.ReactNode;
}

export interface BadgeFormatOptions<T extends string | number = string | number> {
  map?: Record<T, BadgeMapItem>;
  defaultColor?: string;
  fallback?: React.ReactNode;
}

export interface BooleanFormatOptions {
  mode?: "icon" | "badge" | "text";
  trueLabel?: React.ReactNode;
  falseLabel?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function renderTextCell(value: unknown, options: TextFormatOptions = {}): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const str = `${options.prefix ?? ""}${String(value)}${options.suffix ?? ""}`;

  let content: React.ReactNode = str;
  if (options.strong) {
    content = <strong>{content}</strong>;
  }
  if (options.truncate) {
    content = (
      <span
        style={{
          display: "inline-block",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={str}
      >
        {content}
      </span>
    );
  }

  return content;
}

export function renderNumberCell(
  value: unknown,
  options: NumberFormatOptions = {},
): React.ReactNode {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const num = Number(value);
  const formatter = new Intl.NumberFormat(options.locale ?? "en-US", {
    minimumFractionDigits: options.decimals !== undefined ? options.decimals : undefined,
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : undefined,
  });

  const formatted = formatter.format(num);
  const result = `${options.prefix ?? ""}${formatted}${options.suffix ?? ""}`;

  return (
    <div style={{ textAlign: options.align ?? "right", fontVariantNumeric: "tabular-nums" }}>
      {result}
    </div>
  );
}

export function renderCurrencyCell(
  value: unknown,
  options: CurrencyFormatOptions = {},
): React.ReactNode {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const num = Number(value);
  const currency = options.currency ?? "USD";
  const formatter = new Intl.NumberFormat(options.locale ?? "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: options.decimals !== undefined ? options.decimals : 2,
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 2,
  });

  return (
    <div style={{ textAlign: options.align ?? "right", fontVariantNumeric: "tabular-nums" }}>
      {formatter.format(num)}
    </div>
  );
}

export function renderDateCell(value: unknown, options: DateFormatOptions = {}): React.ReactNode {
  if (!value) {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const date = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const locale = options.locale ?? "th-TH";
  const format = options.format ?? "date";

  if (format === "relative") {
    const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const absSeconds = Math.abs(diffSeconds);

    if (absSeconds < 60) return rtf.format(diffSeconds, "second");
    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
    const diffMonths = Math.round(diffDays / 30);
    if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, "month");
    return rtf.format(Math.round(diffDays / 365), "year");
  }

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

  return new Intl.DateTimeFormat(locale, intlOptions).format(date);
}

export function renderBadgeCell<T extends string | number = string | number>(
  value: unknown,
  options: BadgeFormatOptions<T> = {},
): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const key = value as T;
  const config = options.map?.[key];
  const color = config?.color ?? options.defaultColor ?? undefined;
  const label = config?.label ?? String(value);

  return <Badge color={color}>{label}</Badge>;
}

export function renderBooleanCell(
  value: unknown,
  options: BooleanFormatOptions = {},
): React.ReactNode {
  if (value === null || value === undefined) {
    return options.fallback ?? <span style={{ color: "var(--color-placeholder)" }}>-</span>;
  }

  const bool = Boolean(value);
  const mode = options.mode ?? "icon";

  if (mode === "icon") {
    return bool ? (
      <Check size={18} stroke="var(--color-energy)" style={{ margin: "0 auto" }} aria-label="Yes" />
    ) : (
      <X size={18} stroke="var(--color-danger)" style={{ margin: "0 auto" }} aria-label="No" />
    );
  }

  if (mode === "badge") {
    return <Badge>{bool ? (options.trueLabel ?? "Yes") : (options.falseLabel ?? "No")}</Badge>;
  }

  return bool ? (options.trueLabel ?? "Yes") : (options.falseLabel ?? "No");
}
