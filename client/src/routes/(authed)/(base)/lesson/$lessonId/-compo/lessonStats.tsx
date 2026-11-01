import { StatisticCharts } from "#/components/statistic";
import { useLessonStatistic } from "#/data/lesson.data";
import { lessonRouteId } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { useLoaderData } from "@tanstack/react-router";
import styles from "../lessonStats.module.css";

export const LessonStatistic = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const { data: statistic } = useLessonStatistic(lesson.id);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>สถิติการเรียน</h3>

      <StatisticCharts statistic={statistic} />
    </div>
  );
};
