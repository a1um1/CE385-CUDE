import ButtonLink from "#/components/buttonLink";
import { Selector } from "#/components/selector";
import { useCourses } from "#/data/course.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/")({ component: Home });

function Home() {
  const courses = useCourses();
  return (
    <>
      {(courses.data?.data || []).map((course) => (
        <Selector key={course.id} label={course.name} />
      ))}
      <div>
        <ButtonLink variant="secondary" to="/play">
          Code Playground
        </ButtonLink>
        <ButtonLink variant="secondary" to="/play-grader">
          Code Grader
        </ButtonLink>
      </div>
    </>
  );
}
