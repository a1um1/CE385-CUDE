import DailyQuest from "#/components/dailyQuest";
import LevelCard from "#/components/levelCard";
import RankingCard from "#/components/rankingCard";
import { useCourses } from "#/data/course.data";
import { useHomeSelection } from "#/store/homeSelection";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import HomePanel from "./-components/home";
import LessonsPanel from "./-components/lessonsPanel";
import styles from "./index.module.css";

export const Route = createFileRoute("/(authed)/(base)/")({
  component: Home,
});

function Home() {
  const { courseId, setCourse } = useHomeSelection();
  const courses = useCourses();

  // drop persisted id that no longer exists (deleted course)
  useEffect(() => {
    if (courseId && courses.data && !courses.data.data.some((c) => c.id === courseId)) {
      setCourse(undefined);
    }
  }, [courseId, courses.data, setCourse]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        {!courseId ? <HomePanel /> : <LessonsPanel courseId={courseId} />}
      </div>

      <aside className={styles.sidebar}>
        <LevelCard />
        <RankingCard />
        <DailyQuest />
      </aside>
    </div>
  );
}
