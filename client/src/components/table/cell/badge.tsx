import Badge from "#/components/badge";
import { EmptyCell } from "#/components/table/cell/empty";

export interface BadgeMapItem {
  color?: string;
  label?: React.ReactNode;
}

export interface BadgeFormatOptions<T extends string | number = string | number> {
  map?: Record<T, BadgeMapItem>;
  defaultColor?: string;
  fallback?: React.ReactNode;
}

export function renderBadgeCell<T extends string | number = string | number>(
  value: unknown,
  options: BadgeFormatOptions<T> = {},
): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return options.fallback ?? <EmptyCell />;
  }

  const key = value as T;
  const config = options.map?.[key];
  const color = config?.color ?? options.defaultColor;
  const label = config?.label ?? String(value);

  return <Badge color={color}>{label}</Badge>;
}
