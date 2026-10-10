import { Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer } from "recharts";
import styles from "./pieChart.module.css";

export interface PieSlice {
  name: string;
  value: number;
  fill?: string;
}

export interface PieChartProps {
  data: PieSlice[];
  height?: number;
}

const PieLegend = ({ data }: { data: PieSlice[] }) => {
  const total = data.reduce((sum, slice) => sum + slice.value, 0) || 1;

  return (
    <ul className={styles.legend}>
      {data.map((slice) => (
        <li key={slice.name} className={styles.item}>
          <span
            className={styles.bar}
            style={{ backgroundColor: slice.fill ?? "var(--color-secondary)" }}
          />
          <span className={styles.name}>{slice.name}</span>
          <span className={styles.percent}>{Math.round((slice.value / total) * 100)}%</span>
        </li>
      ))}
    </ul>
  );
};

export const PieChart = ({ data, height = 300 }: PieChartProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <RechartsPieChart>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} />
      <Legend content={<PieLegend data={data} />} />
    </RechartsPieChart>
  </ResponsiveContainer>
);
