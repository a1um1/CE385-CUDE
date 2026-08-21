import type { PaginationState, ReactTable, RowData } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Button from "../button";
import styles from "./table.module.css";
import type { DefaultTableFeatures } from "./features";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export interface DataTablePaginationProps<TData extends RowData = RowData> {
  table:
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
}

export function DataTablePagination<TData extends RowData = RowData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPageSizeSelect = false,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getRowCount();

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
          <div className={styles.pageSizeSelectWrapper}>
            <span>Rows per page:</span>
            <select
              aria-label="Rows per page"
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
            icon
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
            icon
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
            icon
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
            icon
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
