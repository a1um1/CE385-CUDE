import * as React from "react";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import SearchField from "#/components/searchField/searchField";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminDeleteVideo, useAdminVideoListQuery } from "#/data/admin/video.data";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { createFileRoute } from "@tanstack/react-router";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

const videoSearchSchema = basicPaginationSchema.extend({
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/video/")({
  validateSearch: (search) => videoSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Video Resources",
    pageKey: "admin-video-list",
  },
});

type AdminVideo = NonNullable<ReturnType<typeof useAdminVideoListQuery>["data"]>["data"][number];

const columnHelper = createTableColumnHelper<AdminVideo>();

const typedColumns = (onDelete: (video: AdminVideo) => void) =>
  columnHelper.columns([
    columnHelper.text("title", {
      header: "Title",
      strong: true,
    }),
    columnHelper.display({
      id: "youtubeUrl",
      header: "YouTube URL",
      cell: (info) => (
        <a href={info.row.original.youtubeUrl} target="_blank" rel="noopener noreferrer">
          {info.row.original.youtubeUrl}
        </a>
      ),
    }),
    columnHelper.text("author", {
      header: "Author",
    }),
    columnHelper.display({
      id: "tags",
      header: "Tags",
      cell: (info) => info.row.original.tags.map((tag) => tag.name).join(", "),
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
            to="/admin/video/$id"
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
  const deleteMutation = useAdminDeleteVideo();
  const [deleting, setDeleting] = React.useState<AdminVideo | null>(null);

  const columns = React.useMemo(() => typedColumns(setDeleting), []);

  const sorting: SortingState = React.useMemo(() => {
    const sortBy = search.sortBy ?? "createdAt";
    const sortOrder = search.sortOrder ?? "desc";
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

  const { data, isLoading } = useAdminVideoListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: (search.sortBy ?? "createdAt") as any,
    sortOrder: search.sortOrder ?? "desc",
    search: search.search,
  });

  const handleSearch = (value: string | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value,
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

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Video deleted");
        setDeleting(null);
      },
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Failed to delete video");
      },
    });
  };

  return (
    <>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        toolbarActions={
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "space-between",
              flex: "1",
            }}
          >
            <SearchField
              placeholder="Title or tag"
              initialValue={search.search}
              onSearch={handleSearch}
            />
            <ButtonLink to="/admin/video/create" variant="primary">
              Create New Video
            </ButtonLink>
          </div>
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
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete Video"
        description={`Delete "${deleting?.title ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
