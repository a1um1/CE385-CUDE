import ButtonLink from "#/components/buttonLink";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/course/")({
  validateSearch: (search) => basicPaginationSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Courses",
    pageKey: "admin-course-list",
  },
});

type AdminCourse = NonNullable<ReturnType<typeof useAdminCourseListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminCourse>();

const typedColumns = columnHelper.columns([
  columnHelper.text("name", {
    header: "Name",
    strong: true,
  }),
  columnHelper.color("color", {
    header: "Color",
  }),
  columnHelper.text("icon", {
    header: "Icon",
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
  });

  return (
    <>
      <ButtonLink to="/admin/course/create" variant="primary">
        Create New Course
      </ButtonLink>
      <DataTable
        data={data?.data ?? []}
        columns={typedColumns}
        isLoading={isLoading}
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
