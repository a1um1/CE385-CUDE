import ButtonLink from "#/components/buttonLink";
import Select from "#/components/select";
import { useCourses } from "#/data/course.data";
import { useLessonFromUnitQuery } from "#/data/lesson.data";
import { useUnitFromCourseQuery } from "#/data/unit.data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookTextIcon, FaceSlightlyFrowning } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(base)/")({ component: Home });

function Home() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const courses = useCourses();
  const units = useUnitFromCourseQuery(selectedCourse);
  const lessons = useLessonFromUnitQuery(selectedUnit);

  const handleCourseChange = (courseId: string | null) => {
    setSelectedCourse(courseId);
    setSelectedUnit(null);
  };

  const handleUnitChange = (unitId: string | null) => {
    setSelectedUnit(unitId);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <Select.Root
          value={selectedCourse}
          onValueChange={handleCourseChange}
          items={
            courses.data?.data.map((course) => ({ value: course.id, label: course.name })) || []
          }
        >
          <Select.Trigger>
            <Select.Value placeholder="Select a course" />
          </Select.Trigger>
          <Select.Content>
            {courses.data?.data.map((course) => (
              <Select.Item key={course.id} value={course.id}>
                {course.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <Select.Root
          value={selectedUnit}
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

        <div className="flex gap-2 ml-auto">
          <ButtonLink variant="secondary" to="/play">
            Code Playground
          </ButtonLink>
          <ButtonLink variant="secondary" to="/play-grader">
            Code Grader
          </ButtonLink>
        </div>
      </div>
      {(lessons.data || []).length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <FaceSlightlyFrowning className="size-24" />
          <p>No lessons found for the selected unit.</p>
        </div>
      )}
      {lessons.data?.map((lesson) => (
        <Link
          key={lesson.id}
          to="/lesson/$lessonId"
          params={{
            lessonId: lesson.id,
          }}
          className="flex items-center gap-4 p-4 hover:bg-gray-500/10"
        >
          <BookTextIcon />
          <p>{lesson.name}</p>
        </Link>
      ))}
    </>
  );
}
