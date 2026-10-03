import * as React from "react";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminCourseListQuery, useAdminReorderCourse } from "#/data/admin/course.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { createFileRoute } from "@tanstack/react-router";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { z } from "zod";

const courseListSearchSchema = basicPaginationSchema.extend({
  sortBy: z.string().optional().default("position"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const Route = createFileRoute("/admin/course/")({
  validateSearch: (search) => courseListSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Courses",
    pageKey: "admin-course-list",
  },
});

type AdminCourse = NonNullable<ReturnType<typeof useAdminCourseListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminCourse>();

interface OrderControlsProps {
  courseId: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

interface CourseTableMeta {
  canReorder: boolean;
  isLastPage: boolean;
}

/**
 * Each row owns its own mutation instance, so the pending state disables only
 * the row being moved instead of the whole table.
 */
function OrderControls({ courseId, index, isFirst, isLast }: OrderControlsProps) {
  const { isPending, mutate } = useAdminReorderCourse();

  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      <Button
        size="xs"
        variant="secondary"
        icon
        aria-label="Move course up"
        disabled={isFirst || isPending}
        onClick={() => mutate({ id: courseId, position: index - 1 })}
      >
        <ArrowUp size={14} />
      </Button>
      <Button
        size="xs"
        variant="secondary"
        icon
        aria-label="Move course down"
        disabled={isLast || isPending}
        onClick={() => mutate({ id: courseId, position: index + 1 })}
      >
        <ArrowDown size={14} />
      </Button>
    </div>
  );
}

const typedColumns = columnHelper.columns([
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
  columnHelper.number("position", {
    header: "Position",
    decimals: 0,
  }),
  columnHelper.datetime("createdAt", {
    header: "Created At",
  }),
  columnHelper.display({
    id: "order",
    header: "Order",
    cell: (info) => {
      const { canReorder, isLastPage } = (info.table.options.meta ?? {}) as CourseTableMeta;
      if (!canReorder) return null;

      const { index, original } = info.row;
      const { rows } = info.table.getRowModel();
      return (
        <OrderControls
          courseId={original.id}
          index={index}
          isFirst={index === 0}
          isLast={index === rows.length - 1 && isLastPage}
        />
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const { id } = info.row.original;
      return (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ButtonLink size="xs" variant="secondary" to="/admin/course/$id" params={{ id }}>
            Edit
          </ButtonLink>
        </div>
      );
    },
  }),
]);

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

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
        // Clearing the sort returns to the catalog order rather than an
        // undefined sort, which the server would otherwise read as "newest first".
        sortBy: firstSort?.id ?? "position",
        sortOrder: firstSort ? (firstSort.desc ? "desc" : "asc") : "asc",
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
    sortBy: search.sortBy as any,
    sortOrder: search.sortOrder,
  });

  const isFirstPage = !search.cursor && search.direction === "forward";
  // "Up" and "down" only mean adjacent rows while the table is in catalog
  // order, and only rows on the first page are part of a contiguous window.
  const canReorder = isFirstPage && search.sortBy === "position" && search.sortOrder === "asc";
  const isLastPage = !data?.nextCursor;

  return (
    <>
      <ButtonLink to="/admin/course/create" variant="primary">
        Create New Course
      </ButtonLink>
      <DataTable
        data={data?.data ?? []}
        columns={typedColumns}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        tableOptions={{ meta: { canReorder, isLastPage } }}
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
