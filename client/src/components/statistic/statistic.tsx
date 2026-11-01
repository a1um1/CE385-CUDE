import { PieChart } from "#/components/pie-chart";
import { ScoreDistribution } from "#/components/score-distribution";
import type { components } from "#/data/base/openapi";

export type StatisticData = Pick<
  components["schemas"]["AdminLessonStats"],
  "totalAttempts" | "passed" | "failed" | "inProgress" | "gaveUp" | "scoreDistribution"
>;

export interface StatisticChartsProps {
  statistic?: StatisticData | null;
}

export const StatisticCharts = ({ statistic }: StatisticChartsProps) => (
  <>
    <PieChart
      data={[
        { name: "ผ่าน", value: statistic?.passed.count ?? 0, fill: "var(--color-success)" },
        { name: "ไม่ผ่าน", value: statistic?.failed.count ?? 0, fill: "var(--color-danger)" },
        { name: "ยอมแพ้", value: statistic?.gaveUp.count ?? 0, fill: "var(--color-warning)" },
        { name: "กำลังเรียน", value: statistic?.inProgress.count ?? 0, fill: "var(--color-info)" },
      ]}
    />

    <h4 className="text-lg font-bold">การกระจายคะแนน</h4>

    <ScoreDistribution data={statistic?.scoreDistribution ?? []} height={250} />
  </>
);
