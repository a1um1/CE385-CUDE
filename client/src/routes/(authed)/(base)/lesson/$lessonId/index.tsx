import LessonReward from "#/components/lessonReward";
import { LessonHistory } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonHistory";
import { LessonScore } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonScore";
import { LessonStart } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonStart";
import { LessonStatistic } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonStats";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import styles from "./lesson.module.css";

const lessonRouteId = "/(authed)/(base)/lesson/$lessonId";

export const Route = createFileRoute("/(authed)/(base)/lesson/$lessonId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const lesson = useLoaderData({ from: lessonRouteId });

  return (
    <>
      <div>
        <Link to="/" className={styles.backLink}>
          <ChevronLeft />
          เนื้อหาทั้งหมด
        </Link>
      </div>
      <div className={styles.contentContainer}>
        <LessonScore />
        <div className={styles.middleColumn}>
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className={styles.lessonTitle}>{lesson?.name}</h1>

          <div className={styles.startButtonContainer}>
            <LessonStart />
          </div>
        </div>
        <LessonReward xp={lesson.XPgiven} gems={lesson.gemsGiven} />
      </div>
      <div className={styles.bottomSection}>
        <LessonHistory />
        <LessonStatistic />
      </div>
    </>
  );
}
