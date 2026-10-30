import * as React from "react";

import Button from "#/components/button";
import Input from "#/components/input";

export interface SearchFieldProps {
  placeholder: string;
  initialValue?: string;
  className?: string;
  onSearch: (value: string | undefined) => void;
}

/**
 * Labelled search box with a submit button and Enter support. The page owns
 * the URL state; this only reports the trimmed value (or `undefined` when
 * empty) on submit.
 */
export default function SearchField({
  placeholder,
  initialValue,
  className,
  onSearch,
}: SearchFieldProps) {
  const [value, setValue] = React.useState(initialValue ?? "");

  const submit = () => onSearch(value.trim() || undefined);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted-text)" }}>
        Search
      </span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Input
          size="sm"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
        <Button size="sm" onClick={submit}>
          Search
        </Button>
      </div>
    </div>
  );
}
