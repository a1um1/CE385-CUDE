import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { clsx } from "clsx";
import styles from "./autocomplete.module.css";

export interface AutocompleteOption {
  /** Unique value filled into the input when the option is picked. */
  value: string;
  label: string;
  description?: string;
}

export interface AutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  items: AutocompleteOption[];
  onSelect?: (item: AutocompleteOption) => void;
  placeholder?: string;
  size?: "sm" | "md";
  emptyText?: string;
  className?: string;
}

export function Autocomplete({
  value,
  onValueChange,
  items,
  onSelect,
  placeholder,
  size = "md",
  emptyText = "No matches",
  className,
}: AutocompleteProps) {
  return (
    <AutocompletePrimitive.Root
      items={items}
      value={value}
      onValueChange={onValueChange}
      itemToStringValue={(item: AutocompleteOption) => item.value}
      filter={(item: AutocompleteOption, query: string) =>
        `${item.label} ${item.description ?? ""} ${item.value}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      }
      openOnInputClick
    >
      <AutocompletePrimitive.Input
        placeholder={placeholder}
        className={clsx(styles.input, size === "sm" && styles["size-sm"], className)}
      />
      <AutocompletePrimitive.Portal>
        <AutocompletePrimitive.Positioner sideOffset={4} align="start">
          <AutocompletePrimitive.Popup className={styles.popup}>
            <AutocompletePrimitive.List>
              {(item: AutocompleteOption) => (
                <AutocompletePrimitive.Item
                  key={item.value}
                  value={item}
                  className={styles.item}
                  onClick={() => onSelect?.(item)}
                >
                  <span className={styles.label}>{item.label}</span>
                  {item.description && (
                    <span className={styles.description}>{item.description}</span>
                  )}
                </AutocompletePrimitive.Item>
              )}
            </AutocompletePrimitive.List>
            <AutocompletePrimitive.Empty className={styles.empty}>
              {emptyText}
            </AutocompletePrimitive.Empty>
          </AutocompletePrimitive.Popup>
        </AutocompletePrimitive.Positioner>
      </AutocompletePrimitive.Portal>
    </AutocompletePrimitive.Root>
  );
}

export default Autocomplete;
