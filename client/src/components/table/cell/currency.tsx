import * as React from "react";
import { renderNumericCell } from "./numeric";

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  fallback?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export function renderCurrencyCell(
  value: unknown,
  options: CurrencyFormatOptions = {},
): React.ReactNode {
  const { currency = "THB", locale = "th-TH", decimals = 2, fallback, align = "right" } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return renderNumericCell(value, formatter, align, fallback);
}
