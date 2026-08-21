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
  ColumnDef,
  ColumnDefTemplate,
  DeepKeys,
  HeaderContext,
  RowData,
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "./column-header";
import {
  renderBadgeCell,
  renderBooleanCell,
  renderCurrencyCell,
  renderDateCell,
  renderNumberCell,
  renderTextCell,
} from "./formatters";
import type {
  BadgeFormatOptions,
  BooleanFormatOptions,
  CurrencyFormatOptions,
  DateFormatOptions,
  NumberFormatOptions,
  TextFormatOptions,
} from "./formatters";

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
 * Creates an enhanced column helper pre-configured with typed field presets.
 */
export function createTableColumnHelper<TData extends RowData = RowData>() {
  const baseHelper = createColumnHelper<DefaultTableFeatures, TData>();

  return {
    ...baseHelper,

    /**
     * Define a string/text column with optional bolding, fallback, and truncation.
     */
    text: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: TextFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, fallback, strong, truncate, prefix, suffix, ...rest } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) =>
          renderTextCell(info.getValue(), { fallback, strong, truncate, prefix, suffix }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Define a numeric column with locale decimal formatting and right alignment.
     */
    number: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: NumberFieldOptions<TData, unknown> = {},
    ) => {
      const {
        header,
        sortable,
        locale,
        decimals,
        prefix,
        suffix,
        fallback,
        align = "right",
        ...rest
      } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) =>
          renderNumberCell(info.getValue(), { locale, decimals, prefix, suffix, fallback, align }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Define a currency column with symbol formatting (e.g. USD, THB) and right alignment.
     */
    currency: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: CurrencyFieldOptions<TData, unknown> = {},
    ) => {
      const {
        header,
        sortable,
        currency = "USD",
        locale,
        decimals,
        fallback,
        align = "right",
        ...rest
      } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) =>
          renderCurrencyCell(info.getValue(), { currency, locale, decimals, fallback, align }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Define a date column (formatted as YYYY-MM-DD or custom preset).
     */
    date: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: DateFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, format = "date", locale, fallback, ...rest } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) => renderDateCell(info.getValue(), { format, locale, fallback }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Define a datetime column with date and time formatting.
     */
    datetime: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: DateFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, format = "datetime", locale, fallback, ...rest } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) => renderDateCell(info.getValue(), { format, locale, fallback }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Define a badge/enum tag column mapped to status colors.
     */
    badge: <TKey extends DeepKeys<TData>, TVal extends string | number = string | number>(
      accessorKey: TKey,
      options: BadgeFieldOptions<TData, TVal> = {},
    ) => {
      const { header, sortable, map, defaultColor, fallback, ...rest } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) =>
          renderBadgeCell(info.getValue(), { map: map as any, defaultColor, fallback }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Alias for `badge` for enums.
     */
    enum: <TKey extends DeepKeys<TData>, TVal extends string | number = string | number>(
      accessorKey: TKey,
      options: BadgeFieldOptions<TData, TVal> = {},
    ) => {
      const { header, sortable, map, defaultColor, fallback, ...rest } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) =>
          renderBadgeCell(info.getValue(), { map: map as any, defaultColor, fallback }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Define a boolean column rendered with check/cross icons or badges.
     */
    boolean: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: BooleanFieldOptions<TData, unknown> = {},
    ) => {
      const { header, sortable, mode = "icon", trueLabel, falseLabel, fallback, ...rest } = options;
      return baseHelper.accessor(accessorKey as any, {
        header: resolveHeader(header, sortable),
        cell: (info) =>
          renderBooleanCell(info.getValue(), {
            mode,
            trueLabel,
            falseLabel,
            fallback,
          }),
        enableSorting: sortable,
        ...rest,
      }) as ColumnDef<DefaultTableFeatures, TData, any>;
    },

    /**
     * Generic field helper accepting dynamic `type`.
     */
    field: <TKey extends DeepKeys<TData>>(
      accessorKey: TKey,
      options: GenericFieldOptions<TData, unknown> = {},
    ) => {
      const { type = "text", ...fieldOptions } = options;
      switch (type) {
        case "number": {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) => renderNumberCell(info.getValue(), fieldOptions),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
        case "currency": {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) => renderCurrencyCell(info.getValue(), fieldOptions),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
        case "date": {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) => renderDateCell(info.getValue(), { ...fieldOptions, format: "date" }),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
        case "datetime": {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) =>
              renderDateCell(info.getValue(), { ...fieldOptions, format: "datetime" }),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
        case "badge": {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) => renderBadgeCell(info.getValue(), fieldOptions),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
        case "boolean": {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) => renderBooleanCell(info.getValue(), fieldOptions),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
        case "text":
        default: {
          return baseHelper.accessor(accessorKey as any, {
            header: resolveHeader(fieldOptions.header, fieldOptions.sortable),
            cell: (info) => renderTextCell(info.getValue(), fieldOptions),
            enableSorting: fieldOptions.sortable,
            ...fieldOptions,
          }) as ColumnDef<DefaultTableFeatures, TData, any>;
        }
      }
    },
  };
}
