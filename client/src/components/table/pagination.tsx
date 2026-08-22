import type { PaginationState, ReactTable, RowData } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Button from "../button";
import styles from "./table.module.css";
import type { DefaultTableFeatures } from "./features";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export interface CursorPaginationConfig {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  rowCount?: number;
}

export interface DataTablePaginationProps<TData extends RowData = RowData> {
  table?:
    | ReactTable<DefaultTableFeatures, TData>
    | {
        state: { pagination: PaginationState };
        getPageCount: () => number;
        getRowCount: () => number | undefined;
        setPageSize: (size: number) => void;
        setPageIndex: (index: number) => void;
        getCanPreviousPage: () => boolean;
        getCanNextPage: () => boolean;
        previousPage: () => void;
        nextPage: () => void;
      };
  pageSizeOptions?: number[];
  showPageSizeSelect?: boolean;
  cursorPagination?: CursorPaginationConfig;
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

interface PageSizeSelectProps {
  value: number;
  options: number[];
  onChange: (size: number) => void;
}

function PageSizeSelect({ value, options, onChange }: PageSizeSelectProps) {
  return (
    <div className={styles.pageSizeSelectWrapper}>
      <span>Rows per page:</span>
      <select
        aria-label="Rows per page"
        className={styles.pageSizeSelect}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}

interface NavButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}

function PageNavButtons({ buttons }: { buttons: NavButton[] }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
      {buttons.map(({ label, icon, onClick, disabled }) => (
        <Button
          key={label}
          variant="secondary"
          size="xs"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          icon
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DataTablePagination<TData extends RowData = RowData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPageSizeSelect = true,
  cursorPagination,
}: DataTablePaginationProps<TData>) {
  // 1. Cursor-based pagination mode
  if (cursorPagination) {
    const {
      hasNextPage = false,
      hasPreviousPage = false,
      onNextPage,
      onPreviousPage,
      pageSize,
      onPageSizeChange,
      pageSizeOptions: cursorPageSizeOptions = pageSizeOptions,
      rowCount,
    } = cursorPagination;

    const cursorNavButtons: NavButton[] = [
      {
        label: "Go to previous page",
        icon: <ChevronLeft size={16} />,
        onClick: onPreviousPage ?? (() => {}),
        disabled: !hasPreviousPage,
      },
      {
        label: "Go to next page",
        icon: <ChevronRight size={16} />,
        onClick: onNextPage ?? (() => {}),
        disabled: !hasNextPage,
      },
    ];

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          {rowCount !== undefined && (
            <span>
              Showing {rowCount} {rowCount === 1 ? "row" : "rows"}
            </span>
          )}
        </div>

        <div className={styles.paginationActions}>
          {showPageSizeSelect && onPageSizeChange && pageSize !== undefined && (
            <PageSizeSelect
              value={pageSize}
              options={cursorPageSizeOptions}
              onChange={onPageSizeChange}
            />
          )}
          <PageNavButtons buttons={cursorNavButtons} />
        </div>
      </div>
    );
  }

  // 2. Standard offset-based pagination mode
  if (!table) return null;

  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getRowCount();

  const offsetNavButtons: NavButton[] = [
    {
      label: "Go to first page",
      icon: <ChevronsLeft size={16} />,
      onClick: () => table.setPageIndex(0),
      disabled: !table.getCanPreviousPage(),
    },
    {
      label: "Go to previous page",
      icon: <ChevronLeft size={16} />,
      onClick: () => table.previousPage(),
      disabled: !table.getCanPreviousPage(),
    },
    {
      label: "Go to next page",
      icon: <ChevronRight size={16} />,
      onClick: () => table.nextPage(),
      disabled: !table.getCanNextPage(),
    },
    {
      label: "Go to last page",
      icon: <ChevronsRight size={16} />,
      onClick: () => table.setPageIndex(pageCount - 1),
      disabled: !table.getCanNextPage(),
    },
  ];

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        <span>
          Page {totalRows !== undefined && totalRows > 0 ? pageIndex + 1 : 0} of {pageCount}
        </span>
        {totalRows !== undefined && (
          <span style={{ color: "var(--color-placeholder)" }}>
            ({totalRows} {totalRows === 1 ? "row" : "rows"})
          </span>
        )}
      </div>

      <div className={styles.paginationActions}>
        {showPageSizeSelect && (
          <PageSizeSelect
            value={pageSize}
            options={pageSizeOptions}
            onChange={(size) => table.setPageSize(size)}
          />
        )}
        <PageNavButtons buttons={offsetNavButtons} />
      </div>
    </div>
  );
}
