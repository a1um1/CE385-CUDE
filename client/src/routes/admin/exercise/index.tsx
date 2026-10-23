import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import DataTable from "#/components/table";
import Badge from "#/components/badge";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminExerciseListQuery } from "#/data/admin/exercise.data";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
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

const exercisePaginationSchema = basicPaginationSchema.extend({
  lessonID: z.string().optional(),
});

export const Route = createFileRoute("/admin/exercise/")({
  validateSearch: (search) => exercisePaginationSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Exercises",
    pageKey: "admin-exercise-list",
  },
});

type AdminExercise = NonNullable<
  ReturnType<typeof useAdminExerciseListQuery>["data"]
>["data"][number];

const columnHelper = createTableColumnHelper<AdminExercise>();

const buildColumns = (lessonMap: Map<string, string>) =>
  columnHelper.columns([
    columnHelper.text("name", {
      header: "Name",
      strong: true,
    }),
    columnHelper.display({
      id: "type",
      header: "Type",
      cell: (info) => (
        <Badge
          color={info.row.original.type === "CODE" ? "var(--color-primary)" : "var(--color-muted)"}
        >
          {info.row.original.type === "CODE" ? "CODE" : "READING"}
        </Badge>
      ),
    }),
    columnHelper.number("position", {
      header: "Position",
      align: "center",
    }),
    columnHelper.display({
      id: "lesson",
      header: "Lesson",
      cell: (info) => (
        <span>{lessonMap.get(info.row.original.lessonID) ?? info.row.original.lessonID}</span>
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
            to="/admin/exercise/$id"
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

  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
  });

  const lessonMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const lesson of lessonsQuery.data?.items ?? []) {
      map.set(lesson.id, lesson.name);
    }
    return map;
  }, [lessonsQuery.data?.items]);

  const lessonFilterItems = React.useMemo(() => {
    const items = [{ value: "ALL", label: "All Lessons" }];
    for (const lesson of lessonsQuery.data?.items ?? []) {
      items.push({ value: lesson.id, label: lesson.name });
    }
    return items;
  }, [lessonsQuery.data?.items]);

  const typedColumns = React.useMemo(() => buildColumns(lessonMap), [lessonMap]);

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

  const handleLessonFilterChange = (lessonID: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        lessonID: lessonID === "ALL" || !lessonID ? undefined : lessonID,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const query = useAdminExerciseListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: search.sortBy as any,
    sortOrder: search.sortOrder,
    lessonID: search.lessonID,
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              Lesson:
            </span>
            <SelectRoot
              value={search.lessonID ?? "ALL"}
              onValueChange={handleLessonFilterChange}
              size="sm"
              items={lessonFilterItems}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Lessons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Lessons</SelectItem>
                {lessonsQuery.data?.items?.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <ButtonLink
            to="/admin/exercise/create"
            search={{ lessonID: search.lessonID }}
            variant="primary"
          >
            Create Exercise
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
