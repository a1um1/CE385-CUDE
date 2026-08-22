import * as React from "react";
import { EmptyCell } from "./empty";

/** Internal shared helper — not exported from cell/index.ts */
export function renderNumericCell(
  value: unknown,
  formatter: Intl.NumberFormat,
  align: "left" | "center" | "right",
  fallback: React.ReactNode,
): React.ReactNode {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return fallback ?? <EmptyCell />;
  }

  return (
    <div style={{ textAlign: align, fontVariantNumeric: "tabular-nums" }}>
      {formatter.format(Number(value))}
    </div>
  );
}
