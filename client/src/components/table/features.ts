import {
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

export const defaultTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  globalFilteringFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  columnSizingFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filteredRowModel: createFilteredRowModel(),
});

export type DefaultTableFeatures = typeof defaultTableFeatures;

/**
 * Creates a type-safe column helper pre-configured with standard table features.
 */
export function createTableColumnHelper<TData extends RowData = RowData>() {
  return createColumnHelper<DefaultTableFeatures, TData>();
}
