import ButtonLink from "#/components/buttonLink";
import { useVideoListQuery } from "#/data/video.data";
import { youtubeThumbnail } from "#/lib/youtube";
import styles from "./videos.module.css";

const LATEST_VIDEO_COUNT = 6;

export function VideoSections() {
  const { data } = useVideoListQuery({
    perPage: LATEST_VIDEO_COUNT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const videos = data?.data ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.heading}>เนื้อหา</h1>
        <ButtonLink
          to="/videos"
          search={{ cursor: undefined, perPage: 12, direction: "forward" }}
          variant="secondary"
        >
          ดูทั้งหมด
        </ButtonLink>
      </div>
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
    </section>
  );
}

export default VideoSections;
