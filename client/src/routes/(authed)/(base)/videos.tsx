import Button from "#/components/button";
import SearchField from "#/components/searchField/searchField";
import { DataTablePagination } from "#/components/table";
import { useVideoAuthorsQuery, useVideoListQuery, useVideoTagsQuery } from "#/data/video.data";
import { youtubeThumbnail } from "#/lib/youtube";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { createFileRoute } from "@tanstack/react-router";
import { SearchX, VideoOff } from "lucide-react";
import { z } from "zod";
import styles from "./-components/home/videos.module.css";

const videoSearchSchema = basicPaginationSchema.extend({
  search: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
});

export const Route = createFileRoute("/(authed)/(base)/videos")({
  validateSearch: (search) => videoSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data, isLoading } = useVideoListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: search.search,
    tag: search.tag,
    author: search.author,
  });
  const tags = useVideoTagsQuery();
  const authors = useVideoAuthorsQuery();

  const updateFilter = (patch: { search?: string; tag?: string; author?: string }) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const handleNextPage = () => {
    if (!data?.nextCursor) return;
    navigate({
      search: (prev) => ({ ...prev, cursor: data.nextCursor, direction: "forward" }),
    });
  };

  const handlePreviousPage = () => {
    if (!data?.prevCursor) return;
    navigate({
      search: (prev) => ({ ...prev, cursor: data.prevCursor, direction: "backward" }),
    });
  };

  const clearFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: undefined,
        tag: undefined,
        author: undefined,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const videos = data?.data ?? [];
  const hasFilters = Boolean(search.search || search.tag || search.author);
  const tagsWithVideos = (tags.data ?? []).filter((tag) => tag.videoCount > 0);

  return (
    <div className={styles.section}>
      <h1 className={styles.heading}>วิดีโอทั้งหมด</h1>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h2 className={styles.filterHeading}>ผู้เขียน</h2>
            <div className={styles.filterList}>
              <Button
                className={styles.filterItem}
                align="start"
                size="sm"
                variant={search.author ? "ghost" : "secondary"}
                onClick={() => updateFilter({ author: undefined })}
              >
                ผู้เขียนทั้งหมด
              </Button>
              {(authors.data ?? []).map((author) => (
                <Button
                  key={author.name}
                  className={styles.filterItem}
                  align="start"
                  size="sm"
                  variant={search.author === author.name ? "secondary" : "ghost"}
                  disabled={authors.isLoading}
                  onClick={() =>
                    updateFilter({
                      author: search.author === author.name ? undefined : author.name,
                    })
                  }
                >
                  {author.name} ({author.videoCount})
                </Button>
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.filterGroup}>
            <h2 className={styles.filterHeading}>แท็ก</h2>
            <div className={styles.filterList}>
              <Button
                className={styles.filterItem}
                align="start"
                size="sm"
                variant={search.tag ? "ghost" : "secondary"}
                onClick={() => updateFilter({ tag: undefined })}
              >
                ทั้งหมด
              </Button>
              {tagsWithVideos.map((tag) => (
                <Button
                  key={tag.id}
                  className={styles.filterItem}
                  align="start"
                  size="sm"
                  variant={search.tag === tag.name ? "secondary" : "ghost"}
                  onClick={() =>
                    updateFilter({ tag: search.tag === tag.name ? undefined : tag.name })
                  }
                >
                  {tag.name} ({tag.videoCount})
                </Button>
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.content}>
          <SearchField
            key={search.search ?? ""}
            className={styles.searchField}
            size="md"
            placeholder="ค้นหาจากชื่อวิดีโอ"
            initialValue={search.search}
            onSearch={(value) => updateFilter({ search: value })}
          />

          {isLoading ? (
            <p>กำลังโหลด...</p>
          ) : videos.length === 0 ? (
            <div className={styles.emptyState}>
              {hasFilters ? (
                <SearchX size={40} className={styles.emptyIcon} />
              ) : (
                <VideoOff size={40} className={styles.emptyIcon} />
              )}
              <p className={styles.emptyTitle}>
                {hasFilters ? "ไม่พบวิดีโอที่ตรงกับเงื่อนไข" : "ยังไม่มีวิดีโอ"}
              </p>
              <p className={styles.emptyDescription}>
                {hasFilters
                  ? "ลองเปลี่ยนคำค้นหา เลือกแท็กอื่น หรือเปลี่ยนผู้เขียน"
                  : "วิดีโอใหม่จะแสดงที่นี่เมื่อมีเนื้อหาเพิ่มเข้ามา"}
              </p>
              {hasFilters && (
                <Button size="sm" variant="secondary" onClick={clearFilters}>
                  ล้างตัวกรองทั้งหมด
                </Button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {videos.map((video) => (
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={video.id}
                  className={styles.card}
                >
                  <div className={styles.imageContainer}>
                    <img
                      src={youtubeThumbnail(video.youtubeUrl)}
                      alt={video.title}
                      className={styles.image}
                    />
                  </div>
                  <h2 className={styles.title}>{video.title}</h2>
                  <p className={styles.author}>{video.author}</p>
                </a>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <div className={styles.paginationWrapper}>
              <DataTablePagination
                cursorPagination={{
                  hasNextPage: Boolean(data?.nextCursor),
                  hasPreviousPage: Boolean(data?.prevCursor),
                  onNextPage: handleNextPage,
                  onPreviousPage: handlePreviousPage,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
