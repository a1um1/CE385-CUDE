import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ScoreBin {
  min: number;
  max: number;
  count: number;
}

export interface ScoreDistributionProps {
  data: ScoreBin[];
  height?: number;
}

const axisTick = { fill: "var(--color-secondary-text)", fontSize: 12 };

export const ScoreDistribution = ({ data, height = 300 }: ScoreDistributionProps) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data.map((bin) => ({ ...bin, label: `${bin.min}-${bin.max}` }))}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
      <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
      <YAxis
        allowDecimals={false}
        tick={axisTick}
        axisLine={false}
        tickLine={false}
        domain={[0, "dataMax "]}
      />
      <Tooltip
        cursor={{ fill: "var(--color-secondary)", opacity: 0.4 }}
        contentStyle={{
          background: "var(--color-background)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius)",
          padding: "0.1rem 0.5rem",
          color: "var(--color-secondary-text)",
        }}
      />
      <Bar dataKey="count" name="จำนวน" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
