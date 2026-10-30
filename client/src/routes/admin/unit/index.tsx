import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import SearchField from "#/components/searchField/searchField";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";
import { createFileRoute } from "@tanstack/react-router";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { z } from "zod";

const unitPaginationSchema = basicPaginationSchema.extend({
  courseID: z.string().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/unit/")({
  validateSearch: (search) => unitPaginationSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Units",
    pageKey: "admin-unit-list",
  },
});

type AdminUnit = NonNullable<ReturnType<typeof useAdminUnitListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminUnit>();

const buildColumns = (courseMap: Map<string, string>) =>
  columnHelper.columns([
    columnHelper.number("position", {
      header: "#",
      align: "center",
    }),
    columnHelper.text("name", {
      header: "Name",
      strong: true,
    }),
    columnHelper.display({
      id: "course",
      header: "Course",
      cell: (info) => (
        <span>{courseMap.get(info.row.original.courseID) ?? info.row.original.courseID}</span>
      ),
    }),
    columnHelper.datetime("createdAt", {
      header: "Created At",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ButtonLink
            size="xs"
            variant="secondary"
            to="/admin/lesson"
            search={{
              page: 1,
              limit: 20,
              unitId: info.row.original.id,
            }}
          >
            Lessons
          </ButtonLink>
          <ButtonLink
            size="xs"
            variant="secondary"
            to="/admin/unit/$id"
            params={{ id: info.row.original.id }}
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

  const coursesQuery = useAdminCourseListQuery({
    perPage: 100,
    direction: "forward",
  });

  const courseMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const course of coursesQuery.data?.data ?? []) {
      map.set(course.id, course.name);
    }
    return map;
  }, [coursesQuery.data?.data]);

  const courseFilterItems = React.useMemo(() => {
    const items = [{ value: "ALL", label: "All Courses" }];
    for (const course of coursesQuery.data?.data ?? []) {
      items.push({ value: course.id, label: course.name });
    }
    return items;
  }, [coursesQuery.data?.data]);

  const typedColumns = React.useMemo(() => buildColumns(courseMap), [courseMap]);

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

  const [pendingCourseID, setPendingCourseID] = React.useState(search.courseID ?? "ALL");

  const handleCourseFilterChange = (courseID: string | null) => {
    setPendingCourseID(courseID ?? "ALL");
  };

  const handleSearch = (searchTerm: string | undefined) => {
    const courseID = pendingCourseID === "ALL" ? undefined : pendingCourseID;
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm,
        courseID,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const query = useAdminUnitListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: (search.sortBy ?? "position") as any,
    sortOrder: search.sortOrder ?? "asc",
    courseID: search.courseID,
    search: search.search,
  });

  const handleNextPage = () => {
    if (!query.data?.nextCursor) return;
    navigate({
      search: (prev) => ({
        ...prev,
        cursor: query.data?.nextCursor,
        direction: "forward",
      }),
    });
  };

  const handlePreviousPage = () => {
    if (!query.data?.prevCursor) return;
    navigate({
      search: (prev) => ({
        ...prev,
        cursor: query.data?.prevCursor,
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
    <DataTable
      toolbarActions={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span
                style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted-text)" }}
              >
                Course
              </span>
              <SelectRoot
                value={pendingCourseID}
                onValueChange={handleCourseFilterChange}
                size="sm"
                items={courseFilterItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courses</SelectItem>
                  {coursesQuery.data?.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <SearchField
              placeholder="Search units"
              initialValue={search.search}
              onSearch={handleSearch}
            />
          </div>

          <ButtonLink
            to="/admin/unit/create"
            search={{ courseID: search.courseID }}
            variant="primary"
          >
            Create Unit
          </ButtonLink>
        </div>
      }
      columns={typedColumns}
      data={query.data?.data ?? []}
      isLoading={query.isLoading}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      manualSorting
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
