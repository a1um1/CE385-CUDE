import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import Input from "#/components/input";
import Button from "#/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";

const coursePaginationSchema = basicPaginationSchema.extend({
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/course/")({
  validateSearch: (search) => coursePaginationSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Courses",
    pageKey: "admin-course-list",
  },
});

type AdminCourse = NonNullable<ReturnType<typeof useAdminCourseListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminCourse>();

const typedColumns = columnHelper.columns([
  columnHelper.number("position", {
    header: "#",
    align: "center",
  }),
  columnHelper.text("name", {
    header: "Name",
    strong: true,
  }),
  columnHelper.color("color", {
    header: "Color",
    sortable: false,
  }),
  columnHelper.text("icon", {
    header: "Icon",
    sortable: false,
  }),
  columnHelper.datetime("createdAt", {
    header: "Created At",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (_info) => (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <ButtonLink
          size="xs"
          variant="secondary"
          to="/admin/unit"
          search={{
            cursor: undefined,
            perPage: 20,
            direction: "forward",
            courseID: _info.row.original.id,
          }}
        >
          Units
        </ButtonLink>
        <ButtonLink
          size="xs"
          variant="secondary"
          to="/admin/course/$id"
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

  const handleSearch = () => {
    const next = nameSearch.trim() || undefined;
    navigate({
      search: (prev) => ({ ...prev, search: next, cursor: undefined, direction: "forward" }),
    });
  };

  const sorting: SortingState = React.useMemo(() => {
    const sortBy = search.sortBy ?? "position";
    const sortOrder = search.sortOrder ?? "asc";
    return [{ id: sortBy, desc: sortOrder === "desc" }];
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

  const { data, isLoading } = useAdminCourseListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: (search.sortBy ?? "position") as any,
    sortOrder: search.sortOrder ?? "asc",
    search: search.search,
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted-text)" }}>
            Search
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Input
              size="sm"
              placeholder="Search courses"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
        <ButtonLink to="/admin/course/create" variant="primary">
          Create New Course
        </ButtonLink>
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={typedColumns}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        toolbarActions={null}
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
