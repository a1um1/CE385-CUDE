import * as React from "react";
import { renderNumericCell } from "./numeric";

export interface NumberFormatOptions {
  locale?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  fallback?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export function renderNumberCell(
  value: unknown,
  options: NumberFormatOptions = {},
): React.ReactNode {
  const { locale = "th-TH", decimals, prefix, suffix, fallback, align = "right" } = options;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Wrap in prefix/suffix by post-formatting the result
  const raw = renderNumericCell(value, formatter, align, fallback);
  if (raw === null || raw === undefined || React.isValidElement(raw)) return raw;

  if (prefix || suffix) {
    const num = Number(value);
    const formatted = `${prefix ?? ""}${formatter.format(num)}${suffix ?? ""}`;
    return <div style={{ textAlign: align, fontVariantNumeric: "tabular-nums" }}>{formatted}</div>;
  }

  return raw;
}
