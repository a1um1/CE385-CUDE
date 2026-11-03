import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminDashboardQuery } from "#/data/admin/dashboard.data";
import styles from "./dashboard.module.css";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
  staticData: {
    pageTitle: "Dashboard",
    pageKey: "admin-dashboard",
  },
});

const numberFormat = new Intl.NumberFormat("en-US");

const formatNumber = (value: number) => numberFormat.format(value);

const formatPercent = (value: number) => `${numberFormat.format(Math.round(value * 10) / 10)}%`;

const formatDay = (value: string) =>
  new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(value));

const axisTick = { fill: "var(--color-secondary-text)", fontSize: 12 };

interface KpiProps {
  label: string;
  value: string;
  detail?: string;
}

const KpiCard = ({ label, value, detail }: KpiProps) => (
  <div className={styles.kpi}>
    <span className={styles.kpiLabel}>{label}</span>
    <span className={styles.kpiValue}>{value}</span>
    {detail && <span className={styles.kpiDetail}>{detail}</span>}
  </div>
);

function RouteComponent() {
  const dashboard = useAdminDashboardQuery();

  if (dashboard.isLoading) {
    return <p className={styles.infoMessage}>กำลังโหลด...</p>;
  }
  if (dashboard.isError || !dashboard.data) {
    return <p className={styles.infoMessage}>ไม่สามารถโหลดข้อมูลแดชบอร์ดได้</p>;
  }

  const { kpis, activity } = dashboard.data;
  const hasActivity = activity.some((day) => day.sessions > 0 || day.submissions > 0);

  return (
    <div className={styles.page}>
      <section className={styles.kpiGrid}>
        <KpiCard
          label="ผู้ใช้ทั้งหมด"
          value={formatNumber(kpis.totalUsers)}
          detail={`+${formatNumber(kpis.newUsers)} ใน 7 วัน`}
        />
        <KpiCard label="ผู้เรียนที่ใช้งาน" value={formatNumber(kpis.activeLearners)} detail="7 วันล่าสุด" />
        <KpiCard label="การเริ่มเรียน" value={formatNumber(kpis.attempts)} detail="7 วันล่าสุด" />
        <KpiCard
          label="อัตราการผ่าน"
          value={formatPercent(kpis.passRate)}
          detail="จาก session ที่จบแล้ว"
        />
        <KpiCard label="XP ที่แจก" value={formatNumber(kpis.xpGranted)} detail="7 วันล่าสุด" />
        <KpiCard label="Gems ที่แจก" value={formatNumber(kpis.gemsGranted)} detail="7 วันล่าสุด" />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>กิจกรรม 30 วันล่าสุด</h2>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: "var(--color-info)" } as React.CSSProperties}
              />
              การเริ่มเรียน
            </span>
            <span className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: "var(--color-success)" } as React.CSSProperties}
              />
              การส่งคำตอบ
            </span>
          </div>
        </div>

        {hasActivity ? (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                interval={4}
                tickFormatter={(value: string) => value.slice(5)}
              />
              <YAxis
                allowDecimals={false}
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                domain={[0, "dataMax"]}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border)" }}
                labelFormatter={(value) => formatDay(String(value))}
                contentStyle={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  padding: "0.1rem 0.5rem",
                  color: "var(--color-secondary-text)",
                }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                name="การเริ่มเรียน"
                stroke="var(--color-info)"
                fill="var(--color-info)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                name="การส่งคำตอบ"
                stroke="var(--color-success)"
                fill="var(--color-success)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.chartEmpty}>ไม่มีกิจกรรมในช่วง 30 วันที่ผ่านมา</div>
        )}
      </section>
    </div>
  );
}
