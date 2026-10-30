import { Course, type CourseStatus } from "#/components/course";
import Select from "#/components/select";
import Skeleton from "#/components/skeleton";
import type { components } from "#/data/base/openapi";
import { useCourses } from "#/data/course.data";
import { useLessonFromUnitQuery } from "#/data/lesson.data";
import { useUnitFromCourseQuery } from "#/data/unit.data";
import { useHomeSelection } from "#/store/homeSelection";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, FaceSlightlyFrowning } from "lucide-react";
import { useEffect } from "react";

const pathOffsets = [0, 48, 0, -48];

const courseStatus: Record<components["schemas"]["LessonStatus"], CourseStatus> = {
  AVAILABLE: "available",
  PENDING: "ongoing",
  PASSED: "passed",
  FAILED: "failed",
  GIVE_UP: "giveUp",
  NOT_AVAILABLE: "unavailable",
};

interface LessonsPanelProps {
  courseId: string;
}

export function LessonsPanel({ courseId }: LessonsPanelProps) {
  const { unitId, setCourse, setUnit } = useHomeSelection();
  const courses = useCourses();
  const units = useUnitFromCourseQuery(courseId);
  const lessons = useLessonFromUnitQuery(unitId);

  const course = courses.data?.data.find((item) => item.id === courseId);

  useEffect(() => {
    if (!units.data?.length) return;
    if (!unitId || !units.data.some((u) => u.id === unitId)) {
      setUnit(units.data[0]?.id);
    }
  }, [unitId, units.data, setUnit]);

  const handleUnitChange = (selectedUnitId: string | null | undefined) => {
    setUnit(selectedUnitId || undefined);
  };

  return (
    <>
      <div className="-mb-4">
        <button onClick={() => setCourse(undefined)} className="flex items-center gap-2">
          <ChevronLeft /> เนื้อหาทั้งหมด
        </button>
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
  );
}

export default LessonsPanel;
