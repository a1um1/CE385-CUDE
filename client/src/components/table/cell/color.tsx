import * as React from "react";
import { EmptyCell } from "#/components/table/cell/empty";

export interface ColorFormatOptions {
  fallback?: React.ReactNode;
  showHex?: boolean;
  shape?: "circle" | "square" | "rounded";
  size?: number | string;
  className?: string;
}

export function renderColorCell(value: unknown, options: ColorFormatOptions = {}): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return options.fallback ?? <EmptyCell />;
  }

  const colorStr = String(value).trim();
  const showHex = options.showHex ?? true;
  const shape = options.shape ?? "circle";
  const size = options.size ?? 16;
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? "4px" : "0px";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        verticalAlign: "middle",
      }}
      className={options.className}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: typeof size === "number" ? `${size}px` : size,
          height: typeof size === "number" ? `${size}px` : size,
          borderRadius,
          backgroundColor: colorStr,
          border: "1px solid color-mix(in oklch, currentColor 20%, transparent)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
          flexShrink: 0,
        }}
      />
      {showHex && (
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.8125rem",
          }}
        >
          {colorStr}
        </span>
      )}
    </div>
  );
}
