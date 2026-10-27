import * as React from "react";
import Badge from "#/components/badge";
import Energy from "#/components/icon/energy";
import Gem from "#/components/icon/gem";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "#/components/select";
import DataTable, { createTableColumnHelper } from "#/components/table";
import { Autocomplete } from "#/components/autocomplete";
import { useAdminUserListQuery } from "#/data/admin/user.data";
import { useAdminTransactionListQuery } from "#/data/admin/transaction.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { useDebouncedValue } from "#/lib/useDebouncedValue";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const transactionSearchSchema = basicPaginationSchema.extend({
  type: z.enum(["ENERGY", "GEM", "XP"]).optional(),
  userSearch: z.string().optional(),
});

export const Route = createFileRoute("/admin/transaction/")({
  validateSearch: (search) => transactionSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Transactions",
    pageKey: "transactions-list",
  },
});

type AdminTransaction = NonNullable<
  ReturnType<typeof useAdminTransactionListQuery>["data"]
>["data"][number];
type CurrencyType = AdminTransaction["type"];

const columnHelper = createTableColumnHelper<AdminTransaction>();

const typeColors: Record<CurrencyType, string> = {
  ENERGY: "var(--color-primary)",
  GEM: "#8B5CF6",
  XP: "#F59E0B",
};

const currencyIcons: Record<CurrencyType, React.FC> = {
  ENERGY: Energy,
  GEM: Gem,
  XP: () => <span>XP</span>,
};

const typedColumns = columnHelper.columns([
  columnHelper.display({
    id: "user",
    header: "User",
    cell: (info) => {
      const { name, email } = info.row.original.user;
      return (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted-text)" }}>{email}</div>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "type",
    header: "Type",
    cell: (info) => (
      <Badge color={typeColors[info.row.original.type]}>{info.row.original.type}</Badge>
    ),
  }),
  columnHelper.text("reason", {
    header: "Transaction",
    sortable: false,
  }),
  columnHelper.display({
    id: "amount",
    header: "Amount",
    cell: (info) => {
      const { type, amount } = info.row.original;
      const CurrencyIcon = currencyIcons[type];
      return (
        <span className="flex gap-0.5">
          {amount > 0 ? "+" : "-"}
          {Math.abs(amount).toLocaleString()}
          <CurrencyIcon />
        </span>
      );
    },
  }),
  columnHelper.datetime("createdAt", {
    header: "Created At",
    sortable: false,
  }),
]);

const typeFilterItems = [
  { value: "ALL", label: "All Types" },
  { value: "ENERGY", label: "Energy" },
  { value: "GEM", label: "Gem" },
  { value: "XP", label: "XP" },
];

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [userSearch, setUserSearch] = React.useState(search.userSearch ?? "");
  const debouncedUserSearch = useDebouncedValue(userSearch);

  // Keep the URL (and therefore cursor pagination) linkable without a request per keystroke.
  React.useEffect(() => {
    const next = debouncedUserSearch.trim() || undefined;
    if (next === search.userSearch) return;
    navigate({
      search: (prev) => ({
        ...prev,
        userSearch: next,
        cursor: undefined,
        direction: "forward",
      }),
      replace: true,
    });
  }, [debouncedUserSearch, search.userSearch, navigate]);

  const query = useAdminTransactionListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    type: search.type,
    userSearch: search.userSearch,
  });

  const suggestions = useAdminUserListQuery(
    { perPage: 10, direction: "forward", search: search.userSearch },
    { enabled: (search.userSearch?.length ?? 0) >= 2 },
  );

  const handleTypeChange = (type: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        type: type === "ALL" || !type ? undefined : (type as CurrencyType),
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const handleNextPage = () => {
    if (!query.data?.nextCursor) return;
    navigate({
      search: (prev) => ({ ...prev, cursor: query.data?.nextCursor, direction: "forward" }),
    });
  };

  const handlePreviousPage = () => {
    if (!query.data?.prevCursor) return;
    navigate({
      search: (prev) => ({ ...prev, cursor: query.data?.prevCursor, direction: "backward" }),
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({ ...prev, perPage: newSize, cursor: undefined, direction: "forward" }),
    });
  };

  return (
    <DataTable
      toolbarActions={
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted-text)" }}
            >
              Type
            </span>
            <SelectRoot
              value={search.type ?? "ALL"}
              onValueChange={handleTypeChange}
              size="sm"
              items={typeFilterItems}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {typeFilterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted-text)" }}
            >
              User
            </span>
            <Autocomplete
              size="sm"
              placeholder="Search name or email"
              value={userSearch}
              onValueChange={setUserSearch}
              items={(suggestions.data?.data ?? []).map((user) => ({
                value: user.email,
                label: user.name,
                description: user.email,
              }))}
              emptyText="No matching user"
            />
          </div>
        </div>
      }
      columns={typedColumns}
      data={query.data?.data ?? []}
      isLoading={query.isLoading}
      cursorPagination={{
        hasNextPage: Boolean(query.data?.nextCursor),
        hasPreviousPage: Boolean(query.data?.prevCursor),
        onNextPage: handleNextPage,
        onPreviousPage: handlePreviousPage,
        pageSize: search.perPage,
        onPageSizeChange: handlePageSizeChange,
        pageSizeOptions: [10, 20, 50],
      }}
    />
  );
}
