import * as React from "react";
import { useTable } from "@tanstack/react-table";
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  SortingState,
  TableOptions,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import clsx from "clsx";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./primitives";
import { DataTablePagination } from "./pagination";
import { defaultTableFeatures } from "./features";
import type { DefaultTableFeatures } from "./features";
import Input from "../input";
import styles from "./table.module.css";

const DEFAULT_SORTING: SortingState = [];
const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export interface DataTableProps<TData extends RowData = RowData, TValue = unknown> {
  columns: ColumnDef<DefaultTableFeatures, TData, TValue>[];
  data: TData[];

  // Loading & Empty States
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  loadingRowCount?: number;
  emptyComponent?: React.ReactNode;
  emptyText?: string;

  // Search / Global Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  manualFiltering?: boolean;

  // Sorting
  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;

  // Pagination
  showPagination?: boolean;
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;
  pageSizeOptions?: number[];

  // Row callbacks & styling
  onRowClick?: (row: Row<DefaultTableFeatures, TData>) => void;
  getRowId?: (
    originalRow: TData,
    index: number,
    parent?: Row<DefaultTableFeatures, TData>,
  ) => string;

  // Toolbar & Layout
  toolbarActions?: React.ReactNode;
  className?: string;
  tableContainerClassName?: string;
  tableClassName?: string;

  // Additional tanstack table options override
  tableOptions?: Partial<TableOptions<DefaultTableFeatures, TData>>;
}

export function DataTable<TData extends RowData = RowData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  loadingComponent,
  loadingRowCount = 5,
  emptyComponent,
  emptyText = "No results found.",
  searchable = false,
  searchPlaceholder = "Search...",
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange: setControlledGlobalFilter,
  manualFiltering = false,
  sorting: controlledSorting,
  defaultSorting = DEFAULT_SORTING,
  onSortingChange: setControlledSorting,
  manualSorting = false,
  showPagination = true,
  pagination: controlledPagination,
  defaultPagination = DEFAULT_PAGINATION,
  onPaginationChange: setControlledPagination,
  manualPagination = false,
  pageCount,
  rowCount,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onRowClick,
  getRowId,
  toolbarActions,
  className,
  tableContainerClassName,
  tableClassName,
  tableOptions: customTableOptions,
}: DataTableProps<TData, TValue>) {
  // Internal uncontrolled states if not controlled from props
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(defaultSorting);
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>(defaultPagination);
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState<string>("");

  const sorting = controlledSorting !== undefined ? controlledSorting : internalSorting;
  const onSortingChange = setControlledSorting || setInternalSorting;

  const pagination = controlledPagination !== undefined ? controlledPagination : internalPagination;
  const onPaginationChange = setControlledPagination || setInternalPagination;

  const globalFilter =
    controlledGlobalFilter !== undefined ? controlledGlobalFilter : internalGlobalFilter;
  const onGlobalFilterChange = setControlledGlobalFilter || setInternalGlobalFilter;

  // TanStack Table v9 Instance
  const table = useTable<DefaultTableFeatures, TData>({
    features: defaultTableFeatures,
    data,
    columns: columns as unknown as ColumnDef<DefaultTableFeatures, TData, unknown>[],
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange,
    onPaginationChange,
    onGlobalFilterChange,
    manualSorting,
    manualPagination,
    manualFiltering,
    pageCount,
    rowCount,
    getRowId,
    ...customTableOptions,
  });

  const columnCount = columns.length;
  const showToolbar = searchable || Boolean(toolbarActions);

  // Stable skeleton item IDs for rendering loading placeholders
  const skeletonRows = React.useMemo(
    () => Array.from({ length: loadingRowCount }, (_, i) => `row-${i}`),
    [loadingRowCount],
  );
  const skeletonCols = React.useMemo(
    () => Array.from({ length: columnCount }, (_, i) => `col-${i}`),
    [columnCount],
  );

  return (
    <div className={clsx(styles.tableWrapper, className)}>
      {showToolbar && (
        <div className={styles.toolbar}>
          {searchable && (
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={16} />
              <Input
                size="sm"
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          )}
          {toolbarActions && <div className={styles.toolbarActions}>{toolbarActions}</div>}
        </div>
      )}

      <Table containerClassName={tableContainerClassName} className={tableClassName}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            loadingComponent ? (
              <TableRow>
                <TableCell colSpan={columnCount} className={styles.cell}>
                  {loadingComponent}
                </TableCell>
              </TableRow>
            ) : (
              skeletonRows.map((rowKey, rowIndex) => (
                <TableRow key={rowKey}>
                  {skeletonCols.map((colKey, cellIndex) => (
                    <TableCell key={colKey}>
                      <div
                        className={styles.skeletonBar}
                        style={{ width: `${60 + (((rowIndex + 1) * (cellIndex + 1) * 17) % 35)}%` }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected?.() && "selected"}
                isClickable={Boolean(onRowClick)}
                onClick={() => onRowClick?.(row)}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className={styles.emptyState}>
                {emptyComponent || emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}
    </div>
  );
}

export default DataTable;
