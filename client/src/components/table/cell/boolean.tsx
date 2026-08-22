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
      <Check style={{ color: "#10B981" }} aria-label="Yes" />
    ) : (
      <X style={{ color: "#EF4444" }} aria-label="No" />
    ),
    badge: (
      <Badge color={bool ? "#10B981" : "#EF4444"}>
        {bool ? (options.trueLabel ?? "Yes") : (options.falseLabel ?? "No")}
      </Badge>
    ),
    text: bool ? (options.trueLabel ?? "Yes") : (options.falseLabel ?? "No"),
  }[mode];
}
