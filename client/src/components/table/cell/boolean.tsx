import Badge from "#/components/badge";
import { EmptyCell } from "#/components/table/cell/empty";
import { Check, X } from "lucide-react";

export interface BooleanFormatOptions {
  mode?: "icon" | "badge" | "text";
  trueLabel?: React.ReactNode;
  falseLabel?: React.ReactNode;
  fallback?: React.ReactNode;
}
export function renderBooleanCell(
  value: unknown,
  options: BooleanFormatOptions = {},
): React.ReactNode {
  if (value === null || value === undefined) return options.fallback ?? <EmptyCell />;

  const bool = Boolean(value);
  const mode = options.mode ?? "icon";

  return {
    icon: bool ? (
      <Check style={{ color: "var(--color-success)" }} aria-label="Yes" />
    ) : (
      <X style={{ color: "var(--color-danger)" }} aria-label="No" />
    ),
    badge: (
      <Badge color={bool ? "var(--color-success)" : "var(--color-danger)"}>
        {bool ? (options.trueLabel ?? "Yes") : (options.falseLabel ?? "No")}
      </Badge>
    ),
    text: bool ? (options.trueLabel ?? "Yes") : (options.falseLabel ?? "No"),
  }[mode];
}
