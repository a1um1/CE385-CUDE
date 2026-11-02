import * as React from "react";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminDeleteEvent, useAdminEventListQuery } from "#/data/admin/event.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { createFileRoute } from "@tanstack/react-router";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/event/")({
  validateSearch: (search) => basicPaginationSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Events",
    pageKey: "admin-event-list",
  },
});

type AdminEvent = NonNullable<ReturnType<typeof useAdminEventListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminEvent>();

const typedColumns = (onDelete: (event: AdminEvent) => void) =>
  columnHelper.columns([
    columnHelper.text("name", {
      header: "Name",
      strong: true,
    }),
    columnHelper.badge("type", {
      header: "Type",
      sortable: false,
      map: {
        EXAM: { color: "var(--color-danger)", label: "Exam" },
        TALK: { color: "var(--color-success)", label: "Talk" },
        OTHER: { color: "var(--color-warning)", label: "Other" },
      },
    }),
    columnHelper.datetime("startAt", {
      header: "Start",
    }),
    columnHelper.datetime("endAt", {
      header: "End",
      sortable: false,
    }),
    columnHelper.text("location", {
      header: "Location",
      sortable: false,
    }),
    columnHelper.text("speaker", {
      header: "Speaker",
      sortable: false,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ButtonLink
            size="xs"
            variant="secondary"
            to="/admin/event/$id"
            params={{ id: info.row.original.id }}
          >
            Edit
          </ButtonLink>
          <Button size="xs" variant="danger" onClick={() => onDelete(info.row.original)}>
            Delete
          </Button>
        </div>
      ),
    }),
  ]);

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const deleteMutation = useAdminDeleteEvent();
  const [deleting, setDeleting] = React.useState<AdminEvent | null>(null);

  const columns = React.useMemo(() => typedColumns(setDeleting), []);

  const sorting: SortingState = React.useMemo(() => {
    const sortBy = search.sortBy ?? "startAt";
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

  const { data, isLoading } = useAdminEventListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: (search.sortBy ?? "startAt") as any,
    sortOrder: search.sortOrder ?? "asc",
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

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Event deleted");
        setDeleting(null);
      },
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Failed to delete event");
      },
    });
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <ButtonLink to="/admin/event/create" variant="primary">
          Create New Event
        </ButtonLink>
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
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
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete Event"
        description={`Delete "${deleting?.name ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
