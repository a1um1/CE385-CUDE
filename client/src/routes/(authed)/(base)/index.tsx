import Button from "#/components/button";
import CIcon from "#/components/codeEditor/icons/CIcon";
import PythonIcon from "#/components/codeEditor/icons/PythonIcon";
import { Course, type CourseStatus } from "#/components/course";
import DailyQuest from "#/components/dailyQuest";
import LevelCard from "#/components/levelCard";
import RankingCard from "#/components/rankingCard";
import Select from "#/components/select";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import { useCourses } from "#/data/course.data";
import { useLessonFromUnitQuery } from "#/data/lesson.data";
import { useUnitFromCourseQuery } from "#/data/unit.data";
import { useHomeSelection } from "#/store/homeSelection";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Book, ChevronLeft, FaceSlightlyFrowning } from "lucide-react";
import { useEffect, type ComponentType, type CSSProperties, type SVGProps } from "react";
import styles from "./index.module.css";

export const Route = createFileRoute("/(authed)/(base)/")({
  component: Home,
});

const pathOffsets = [0, 48, 0, -48];

/** `Course.icon` is a language slug from the seed data. */
const courseIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  python: PythonIcon,
  c: CIcon,
};

const courseStatus: Record<components["schemas"]["LessonStatus"], CourseStatus> = {
  AVAILABLE: "available",
  PENDING: "ongoing",
  PASSED: "passed",
  FAILED: "failed",
  GIVE_UP: "giveUp",
  NOT_AVAILABLE: "unavailable",
};

function Home() {
  const { courseId, unitId, setCourse, setUnit } = useHomeSelection();
  const courses = useCourses();
  const units = useUnitFromCourseQuery(courseId);
  const lessons = useLessonFromUnitQuery(unitId);

  // drop persisted ids that no longer exist (deleted course/unit)
  useEffect(() => {
    if (courseId && courses.data && !courses.data.data.some((c) => c.id === courseId)) {
      setCourse(undefined);
    } else if (unitId && units.data && !units.data.some((u) => u.id === unitId)) {
      setUnit(undefined);
    }
  }, [courseId, unitId, courses.data, units.data, setCourse, setUnit]);

  // a course opens on its first unit
  useEffect(() => {
    if (!courseId || unitId || !units.data?.length) return;
    setUnit(units.data[0]?.id);
  }, [courseId, unitId, units.data, setUnit]);

  const handleUnitChange = (selectedUnitId: string | null | undefined) => {
    setUnit(selectedUnitId || undefined);
  };

  const course = courses.data?.data.find((item) => item.id === courseId);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex min-w-0 flex-[2] flex-col gap-6">
        {!courseId ? (
          <>
            <h1 className="text-3xl font-bold">คอร์สเรียน</h1>
            {courses.isLoading ? (
              <div className={styles["course-grid"]}>
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : (
              <div className={styles["course-grid"]}>
                {courses.data?.data.map((item) => {
                  const Icon = courseIcons[item.icon] ?? Book;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCourse(item.id)}
                      style={{ "--course-color": item.color } as CSSProperties}
                      className={styles["course-card"]}
                    >
                      <Icon className={styles["course-icon"]} />
                      <span className={styles["course-name"]}>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {(courses.data?.data ?? []).length === 0 && !courses.isLoading && (
              <div className="flex flex-col items-center justify-center gap-2">
                <FaceSlightlyFrowning className="size-24" />
                <p>No courses available.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <Button variant="secondary" onClick={() => setCourse(undefined)}>
                <ChevronLeft />
                เนื้อหาทั้งหมด
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-2xl font-bold">{course?.name}</span>
              {units.isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <Select.Root
                  value={unitId}
                  onValueChange={handleUnitChange}
                  items={units.data?.map((unit) => ({ value: unit.id, label: unit.name })) || []}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Select a unit" />
                  </Select.Trigger>
                  <Select.Content>
                    {units.data?.map((unit) => (
                      <Select.Item key={unit.id} value={unit.id}>
                        {unit.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            </div>
            {!lessons.isLoading && (lessons.data || []).length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2">
                <FaceSlightlyFrowning className="size-24" />
                <p>No lessons found for the selected unit.</p>
              </div>
            )}
            {lessons.data && lessons.data.length > 0 && (
              <div className="flex flex-col items-center gap-4 py-6">
                {lessons.data.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    to="/lesson/$lessonId"
                    params={{ lessonId: lesson.id }}
                    className="block"
                    style={{
                      transform: `translateX(${pathOffsets[index % pathOffsets.length] ?? 0}px)`,
                    }}
                  >
                    <Course status={courseStatus[lesson.status]} label={lesson.name} />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <aside className="min-w-0 flex-1 flex flex-col gap-4">
        <LevelCard />
        <RankingCard />
        <DailyQuest />
      </aside>
    </div>
  );
}
