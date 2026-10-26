import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import DataTable, { createTableColumnHelper } from "#/components/table";
import { useAdminUserListQuery } from "#/data/admin/user.data";
import ButtonLink from "#/components/buttonLink";
import Input from "#/components/input";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { z } from "zod";

const userSearchSchema = basicPaginationSchema.extend({
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/user/")({
  validateSearch: (search) => userSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Users",
    pageKey: "admin-user-list",
  },
});

type AdminUser = NonNullable<ReturnType<typeof useAdminUserListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminUser>();

const typedColumns = columnHelper.columns([
  columnHelper.text("name", {
    header: "Name",
    strong: true,
  }),
  columnHelper.text("email", {
    header: "Email",
  }),
  columnHelper.text("epithet", {
    header: "Epithet",
    sortable: false,
  }),
  columnHelper.badge("role", {
    header: "Role",
    map: {
      ADMIN: { color: "#10B981", label: "ADMIN" },
      USER: { color: "#F59E0B", label: "USER" },
    },
  }),
  columnHelper.datetime("createdAt", {
    header: "Created At",
  }),
  columnHelper.boolean("isActive", {
    header: "Is Active",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (_info) => (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <ButtonLink
          size="xs"
          variant="secondary"
          to="/admin/user/$id"
          params={{ id: _info.row.original.id }}
        >
          Edit
        </ButtonLink>
      </div>
    ),
  }),
]);

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [nameSearch, setNameSearch] = React.useState(search.search ?? "");

  // Debounce keystrokes into the URL so cursor pagination stays linkable.
  React.useEffect(() => {
    if (nameSearch === (search.search ?? "")) return;
    const timeout = setTimeout(() => {
      navigate({
        search: (prev) => ({
          ...prev,
          search: nameSearch.trim() || undefined,
          cursor: undefined,
          direction: "forward",
        }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [nameSearch, search.search, navigate]);

  const sorting: SortingState = React.useMemo(() => {
    if (!search.sortBy) return [];
    return [{ id: search.sortBy, desc: search.sortOrder === "desc" }];
  }, [search.sortBy, search.sortOrder]);

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const nextSorting =
      typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
    const [firstSort] = nextSorting;
    navigate({
      search: (prev) => ({
        ...prev,
        sortBy: firstSort?.id,
        sortOrder: firstSort ? (firstSort.desc ? "desc" : "asc") : undefined,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const { data, isLoading } = useAdminUserListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: search.sortBy as any,
    sortOrder: search.sortOrder,
    search: search.search,
  });

  const handleNextPage = () => {
    if (!data?.nextCursor) return;
    navigate({
      search: (prev) => ({
        ...prev,
        cursor: data.nextCursor,
        direction: "forward",
      }),
    });
  };

  const handlePreviousPage = () => {
    if (!data?.prevCursor) return;
    navigate({
      search: (prev) => ({
        ...prev,
        cursor: data.prevCursor,
        direction: "backward",
      }),
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        perPage: newSize,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  return (
    <>
      <DataTable
        data={data?.data ?? []}
        columns={typedColumns}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        toolbarActions={
          <Input
            size="sm"
            placeholder="Search name or email"
            value={nameSearch}
            onChange={(event) => setNameSearch(event.target.value)}
          />
        }
        cursorPagination={{
          hasNextPage: Boolean(data?.nextCursor),
          hasPreviousPage: Boolean(data?.prevCursor),
          onNextPage: handleNextPage,
          onPreviousPage: handlePreviousPage,
          pageSize: search.perPage,
          onPageSizeChange: handlePageSizeChange,
          pageSizeOptions: [10, 20, 50],
        }}
      />
    </>
  );
}
