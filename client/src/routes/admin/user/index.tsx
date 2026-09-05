import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import DataTable, { createTableColumnHelper } from "#/components/table";
import { useAdminUserListQuery } from "#/data/admin/user.data";
import ButtonLink from "#/components/buttonLink";

const userSearchSchema = z.object({
  cursor: z.string().optional(),
  direction: z.enum(["forward", "backward"]).default("forward"),
  perPage: z.number().catch(20).default(20),
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

  const { data, isLoading } = useAdminUserListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
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
        cursor: null,
        direction: "forward",
      }),
    });
  };

  return (
    <div>
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
    </div>
  );
}
