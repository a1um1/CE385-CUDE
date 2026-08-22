import { EmptyCell } from "#/components/table/cell/empty";

export interface TextFormatOptions {
  fallback?: React.ReactNode;
  strong?: boolean;
  truncate?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function renderTextCell(value: unknown, options: TextFormatOptions = {}): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return options.fallback ?? <EmptyCell />;
  }

  const str = `${options.prefix ?? ""}${String(value)}${options.suffix ?? ""}`;

  let content: React.ReactNode = str;
  if (options.strong) content = <strong>{content}</strong>;

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
