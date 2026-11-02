import Button from "#/components/button";
import styles from "./videos.module.css";

const videoMocks: {
  id: string;
  videoURL: string;
  title: string;
  author: string;
  runTime: string;
}[] = [
  {
    id: "intro-cs",
    videoURL: "https://www.youtube.com/watch?v=5LeZflr8Zfs",
    title: "Introduction to Computer Science",
    author: "Khan Academy",
    runTime: "5:44",
  },
  {
    id: "variables-and-data-types",
    videoURL: "https://www.youtube.com/watch?v=52RHZdBSjTw",
    title: "Variables and Data Types",
    author: "Khan Academy",
    runTime: "4:43",
  },
  {
    id: "data-structures",
    videoURL: "https://www.youtube.com/watch?v=WZQRJjeG6lo",
    title: "Data Structures and Algorithms",
    author: "Khan Academy",
    runTime: "3:44",
  },
  {
    id: "c-programming",
    videoURL: "https://www.youtube.com/watch?v=SlqjA04_dpk",
    title: "C Programming",
    author: "CS50",
    runTime: "2:30:17",
  },
];

export function VideoSections() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h1 className={styles.heading}>เนื้อหา</h1>
        <Button variant="secondary">ดูทั้งหมด</Button>
      </div>
      <div className={styles.grid}>
        {videoMocks.map((video) => (
          <a
            href={video.videoURL}
            target="_blank"
            rel="noopener noreferrer"
            key={video.id}
            className={styles.card}
          >
            <div className={styles.imageContainer}>
              <img
                src={`https://img.youtube.com/vi/${video.videoURL.split("v=")[1]}/hqdefault.jpg`}
                alt={video.title}
                className={styles.image}
              />
              <div className={styles.runtimeBadge}>{video.runTime}</div>
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
