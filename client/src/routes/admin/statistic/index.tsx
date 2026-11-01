import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";
import { StatisticCharts } from "#/components/statistic";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import {
  useAdminCourseStats,
  useAdminLessonStats,
  useAdminUnitStats,
} from "#/data/admin/statistic.data";
import styles from "./statistic.module.css";

const statisticSearchSchema = z.object({
  courseId: z.string().optional(),
  unitId: z.string().optional(),
  lessonId: z.string().optional(),
});

export const Route = createFileRoute("/admin/statistic/")({
  validateSearch: (search) => statisticSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Statistics",
    pageKey: "admin-statistics",
  },
});

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    {children}
  </div>
);

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const coursesQuery = useAdminCourseListQuery({ perPage: 100, direction: "forward" });
  const unitsQuery = useAdminUnitListQuery({
    perPage: 100,
    direction: "forward",
    courseID: search.courseId,
  });
  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
    unitId: search.unitId,
  });

  const courseStats = useAdminCourseStats(search.courseId);
  const unitStats = useAdminUnitStats(search.unitId);
  const lessonStats = useAdminLessonStats(search.lessonId);

  const statistic = search.lessonId
    ? lessonStats.data
    : search.unitId
      ? unitStats.data
      : courseStats.data;
  const isLoading = search.lessonId
    ? lessonStats.isLoading
    : search.unitId
      ? unitStats.isLoading
      : courseStats.isLoading;

  const courseItems = React.useMemo(
    () => (coursesQuery.data?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [coursesQuery.data?.data],
  );
  const unitItems = React.useMemo(
    () => (unitsQuery.data?.data ?? []).map((u) => ({ value: u.id, label: u.name })),
    [unitsQuery.data?.data],
  );
  const lessonItems = React.useMemo(
    () => (lessonsQuery.data?.items ?? []).map((l) => ({ value: l.id, label: l.name })),
    [lessonsQuery.data?.items],
  );

  const title = search.lessonId
    ? lessonStats.data?.lessonName
    : search.unitId
      ? unitStats.data?.unitName
      : courseStats.data?.courseName;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.filterControls}>
        <Field label="Course">
          <SelectRoot
            value={search.courseId ?? null}
            onValueChange={(courseId) => navigate({ search: { courseId: courseId ?? undefined } })}
            size="sm"
            items={courseItems}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courseItems.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>

        <Field label="Unit">
          <SelectRoot
            value={search.unitId ?? null}
            onValueChange={(unitId) =>
              navigate({
                search: (prev) => ({ ...prev, unitId: unitId ?? undefined, lessonId: undefined }),
              })
            }
            size="sm"
            items={unitItems}
            disabled={!search.courseId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All units" />
            </SelectTrigger>
            <SelectContent>
              {unitItems.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>

        <Field label="Lesson">
          <SelectRoot
            value={search.lessonId ?? null}
            onValueChange={(lessonId) =>
              navigate({ search: (prev) => ({ ...prev, lessonId: lessonId ?? undefined }) })
            }
            size="sm"
            items={lessonItems}
            disabled={!search.unitId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All lessons" />
            </SelectTrigger>
            <SelectContent>
              {lessonItems.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>
      </div>

      {!search.courseId && !search.unitId && !search.lessonId ? (
        <p className={styles.infoMessage}>เลือกหลักสูตรเพื่อดูสถิติ</p>
      ) : isLoading ? (
        <p className={styles.infoMessage}>กำลังโหลด...</p>
      ) : (
        <div className={styles.statisticsContainer}>
          <h3 className={styles.statisticsTitle}>
            {title} · {statistic?.totalAttempts ?? 0} ครั้ง
          </h3>
          <StatisticCharts statistic={statistic} />
        </div>
      )}
    </div>
  );
}
