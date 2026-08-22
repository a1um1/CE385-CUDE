export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./primitives";

export { DataTable } from "./data-table";
export type { DataTableProps } from "./data-table";

export { DataTablePagination } from "./pagination";
export type { DataTablePaginationProps, CursorPaginationConfig } from "./pagination";

export { DataTableColumnHeader } from "./column-header";
export type { DataTableColumnHeaderProps } from "./column-header";

export { defaultTableFeatures, createTableColumnHelper } from "./features";
export type {
  DefaultTableFeatures,
  TextFieldOptions,
  NumberFieldOptions,
  CurrencyFieldOptions,
  DateFieldOptions,
  BadgeFieldOptions,
  BooleanFieldOptions,
  GenericFieldOptions,
  GenericFieldType,
} from "./features";

export {
  renderTextCell,
  renderNumberCell,
  renderCurrencyCell,
  renderDateCell,
  renderBadgeCell,
  renderBooleanCell,
} from "./formatters";
export type {
  TextFormatOptions,
  NumberFormatOptions,
  CurrencyFormatOptions,
  DateFormatOptions,
  DateFormatPreset,
  BadgeFormatOptions,
  BadgeMapItem,
  BooleanFormatOptions,
} from "./formatters";

export { Badge } from "../badge";
export type { BadgeProps } from "../badge";

// Re-export common TanStack Table utilities & types
export {
  createColumnHelper,
  flexRender,
  useTable,
  tableFeatures,
  stockFeatures,
} from "@tanstack/react-table";

export type {
  ColumnDef,
  Row,
  Table as TanStackTable,
  TableFeatures,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  ColumnVisibilityState,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";

export { default } from "./data-table";
