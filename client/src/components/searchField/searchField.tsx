import * as React from "react";
import { clsx } from "clsx";

import Button from "#/components/button";
import Input from "#/components/input";
import styles from "./searchField.module.css";

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
    <div className={clsx(styles.container, className)}>
      <span className={styles.label}>Search</span>
      <div className={styles.inputRow}>
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
