import * as React from "react";
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
import type {
  AccessorKeyColumnDef,
  CellContext,
  ColumnDef,
  ColumnDefTemplate,
  DeepKeys,
  HeaderContext,
  RowData,
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "./column-header";
import type {
  TextFormatOptions,
  NumberFormatOptions,
  CurrencyFormatOptions,
  DateFormatOptions,
  BadgeFormatOptions,
  BooleanFormatOptions,
} from "#/components/table/cell";
import {
  renderTextCell,
  renderNumberCell,
  renderCurrencyCell,
  renderDateCell,
  renderBadgeCell,
  renderBooleanCell,
} from "#/components/table/cell";

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

type BaseFieldOptions<TData extends RowData, TValue> = Omit<
  Partial<AccessorKeyColumnDef<DefaultTableFeatures, TData, TValue>>,
  "header" | "cell"
> & {
  header?: string | ColumnDefTemplate<HeaderContext<DefaultTableFeatures, TData, TValue>>;
  sortable?: boolean;
};

export type TextFieldOptions<TData extends RowData, TValue> = BaseFieldOptions<TData, TValue> &
  TextFormatOptions;

export type NumberFieldOptions<TData extends RowData, TValue> = BaseFieldOptions<TData, TValue> &
  NumberFormatOptions;

export type CurrencyFieldOptions<TData extends RowData, TValue> = BaseFieldOptions<TData, TValue> &
  CurrencyFormatOptions;

export type DateFieldOptions<TData extends RowData, TValue> = BaseFieldOptions<TData, TValue> &
  DateFormatOptions;

export type BadgeFieldOptions<
  TData extends RowData,
  TValue extends string | number,
> = BaseFieldOptions<TData, TValue> & BadgeFormatOptions<TValue>;

export type BooleanFieldOptions<TData extends RowData, TValue> = BaseFieldOptions<TData, TValue> &
  BooleanFormatOptions;

export type GenericFieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "badge"
  | "boolean";

export type GenericFieldOptions<TData extends RowData, TValue> = BaseFieldOptions<TData, TValue> & {
  type?: GenericFieldType;
} & TextFormatOptions &
  NumberFormatOptions &
  CurrencyFormatOptions &
  DateFormatOptions &
  BadgeFormatOptions<string | number> &
  BooleanFormatOptions;

function resolveHeader<TData extends RowData, TValue>(
  headerOption?: string | ColumnDefTemplate<HeaderContext<DefaultTableFeatures, TData, TValue>>,
  sortable = true,
): ColumnDefTemplate<HeaderContext<DefaultTableFeatures, TData, TValue>> | undefined {
  if (typeof headerOption === "string") {
    if (sortable) {
      return ({ column }) => <DataTableColumnHeader column={column} title={headerOption} />;
    }
    return headerOption;
  }
  return headerOption;
}

/**
 * Shared factory: builds a typed accessor column, eliminating the repeated
 * baseHelper.accessor + resolveHeader + enableSorting + cast pattern.
 */
function makeAccessorColumn<TData extends RowData, TKey extends DeepKeys<TData>>(
  helper: ReturnType<typeof createColumnHelper<DefaultTableFeatures, TData>>,
  accessorKey: TKey,
  header:
    | string
    | ColumnDefTemplate<HeaderContext<DefaultTableFeatures, TData, unknown>>
    | undefined,
  sortable: boolean | undefined,
  renderCell: (info: CellContext<DefaultTableFeatures, TData, unknown>) => React.ReactNode,
  rest: Partial<AccessorKeyColumnDef<DefaultTableFeatures, TData, unknown>>,
): ColumnDef<DefaultTableFeatures, TData, any> {
  return helper.accessor(accessorKey as any, {
    header: resolveHeader(header, sortable),
    cell: renderCell,
    enableSorting: sortable,
    ...rest,
  }) as ColumnDef<DefaultTableFeatures, TData, any>;
}

/**
 * Creates an enhanced column helper pre-configured with typed field presets.
 */
export function createTableColumnHelper<TData extends RowData = RowData>() {
  const helper = createColumnHelper<DefaultTableFeatures, TData>();

  const helpers = {
    ...helper,

    text: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: TextFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, fallback, strong, truncate, prefix, suffix, ...rest } = options;
      return makeAccessorColumn(
        helper,
        accessorKey,
        header,
        sortable,
        (info) => renderTextCell(info.getValue(), { fallback, strong, truncate, prefix, suffix }),
        rest,
      );
    },

    /**
     * Define a numeric column with locale decimal formatting and right alignment.
     */
    number: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: NumberFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, locale, decimals, prefix, suffix, fallback, align, ...rest } =
        options;
      return makeAccessorColumn(
        helper,
        accessorKey,
        header,
        sortable,
        (info) =>
          renderNumberCell(info.getValue(), { locale, decimals, prefix, suffix, fallback, align }),
        rest,
      );
    },

    /**
     * Define a currency column with symbol formatting (e.g. USD, THB) and right alignment.
     */
    currency: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: CurrencyFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, currency, locale, decimals, fallback, align, ...rest } = options;
      return makeAccessorColumn(
        helper,
        accessorKey,
        header,
        sortable,
        (info) =>
          renderCurrencyCell(info.getValue(), { currency, locale, decimals, fallback, align }),
        rest,
      );
    },

    /**
     * Define a date column (formatted as YYYY-MM-DD or custom preset).
     */
    date: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: DateFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, format = "date", fallback, ...rest } = options;
      return makeAccessorColumn(
        helper,
        accessorKey,
        header,
        sortable,
        (info) => renderDateCell(info.getValue(), { format, fallback }),
        rest,
      );
    },

    /**
     * Define a datetime column with date and time formatting.
     * Alias for date with format defaulting to "datetime".
     */
    datetime: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: DateFieldOptions<TData, unknown> = {},
    ) => helpers.date(accessorKey, { format: "datetime", ...options }),

    /**
     * Define a badge/enum tag column mapped to status colors.
     */
    badge: <TKey extends DeepKeys<TData>, TVal extends string | number = string | number>(
      accessorKey: TKey,
      options: BadgeFieldOptions<TData, TVal> = {},
    ) => {
      const { header, sortable, map, defaultColor, fallback, ...rest } = options;
      return makeAccessorColumn(
        helper,
        accessorKey,
        header as any,
        sortable,
        (info) => renderBadgeCell(info.getValue(), { map: map as any, defaultColor, fallback }),
        rest as any,
      );
    },

    boolean: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: BooleanFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, mode = "icon", trueLabel, falseLabel, fallback, ...rest } = options;
      return makeAccessorColumn(
        helper,
        accessorKey,
        header,
        sortable,
        (info) => renderBooleanCell(info.getValue(), { mode, trueLabel, falseLabel, fallback }),
        rest,
      );
    },
  };

  return helpers;
}
