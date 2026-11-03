import * as React from "react";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import SearchField from "#/components/searchField/searchField";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminDeleteVideo, useAdminVideoListQuery } from "#/data/admin/video.data";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

const videoSearchSchema = z.object({
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

type AdminVideo = NonNullable<ReturnType<typeof useAdminVideoListQuery>["data"]>[number];

const columnHelper = createTableColumnHelper<AdminVideo>();

const typedColumns = (onDelete: (video: AdminVideo) => void) =>
  columnHelper.columns([
    columnHelper.text("title", {
      header: "Title",
      strong: true,
      sortable: false,
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
    columnHelper.display({
      id: "tags",
      header: "Tags",
      cell: (info) => info.row.original.tags.join(", "),
    }),
    columnHelper.datetime("createdAt", {
      header: "Created At",
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
  const { data, isLoading } = useAdminVideoListQuery({ search: search.search });

  const handleSearch = (value: string | undefined) => {
    navigate({ search: { search: value } });
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
        data={data ?? []}
        columns={columns}
        isLoading={isLoading}
        showPagination={false}
        toolbarActions={
          <div
            style={{
              display: "flex",
              flex: "1",
              gap: "0.5rem",
              justifyContent: "space-between",
              alignItems: "center",
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
