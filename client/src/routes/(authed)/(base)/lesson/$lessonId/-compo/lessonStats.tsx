import { StatisticCharts } from "#/components/statistic";
import { useLessonStatistic } from "#/data/lesson.data";
import { lessonRouteId } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { useLoaderData } from "@tanstack/react-router";

export const LessonStatistic = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const { data: statistic } = useLessonStatistic(lesson.id);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <h3 className="text-lg font-bold">สถิติการเรียน</h3>

      <StatisticCharts statistic={statistic} />
    </div>
  );
};
