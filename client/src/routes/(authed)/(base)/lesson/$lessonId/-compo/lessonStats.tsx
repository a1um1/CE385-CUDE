import { PieChart } from "#/components/pie-chart";
import { useLessonStatistic } from "#/data/lesson.data";
import { lessonRouteId } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { useLoaderData } from "@tanstack/react-router";

export const LessonStatistic = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const { data: statistic } = useLessonStatistic(lesson.id);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <h3 className="text-lg font-bold">สถิติการเรียน</h3>

      <PieChart
        data={[
          { name: "ผ่าน", value: statistic?.passed.count ?? 0, fill: "var(--color-success)" },
          { name: "ไม่ผ่าน", value: statistic?.failed.count ?? 0, fill: "var(--color-danger)" },
          { name: "ยอมแพ้", value: statistic?.gaveUp.count ?? 0, fill: "var(--color-warning)" },
          { name: "กำลังเรียน", value: statistic?.inProgress.count ?? 0, fill: "#34abeb" },
        ]}
      />
    </div>
  );
};
