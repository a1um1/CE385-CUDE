import * as React from "react";
import type { Column, RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import clsx from "clsx";
import styles from "./table.module.css";
import type { DefaultTableFeatures } from "./features";

export interface DataTableColumnHeaderProps<
  TData extends RowData = RowData,
  TValue = unknown,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DefaultTableFeatures, TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData = RowData, TValue = unknown>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort?.()) {
    return <div className={clsx(styles.headerSortContent, className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted?.();

  return (
    <button
      type="button"
      className={clsx(styles.headerSortContent, styles.headerSortable, className)}
      onClick={column.getToggleSortingHandler?.()}
      aria-label={`Sort by ${title}`}
      style={{
        background: "none",
        border: "none",
        font: "inherit",
        color: "inherit",
        padding: 0,
        textAlign: "inherit",
      }}
    >
      <span>{title}</span>
      {isSorted === "desc" ? (
        <ArrowDown className={clsx(styles.sortIcon, styles.sortIconActive)} size={16} />
      ) : isSorted === "asc" ? (
        <ArrowUp className={clsx(styles.sortIcon, styles.sortIconActive)} size={16} />
      ) : (
        <ArrowUpDown className={styles.sortIcon} size={16} />
      )}
    </button>
  );
}
