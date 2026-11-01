import LessonReward from "#/components/lessonReward";
import { PieChart } from "#/components/pie-chart";
import { LessonHistory } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonHistory";
import { LessonScore } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonScore";
import { LessonStart } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonStart";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

const lessonRouteId = "/(authed)/(base)/lesson/$lessonId";

export const Route = createFileRoute("/(authed)/(base)/lesson/$lessonId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const lesson = useLoaderData({ from: lessonRouteId });

  return (
    <>
      <div>
        <Link to="/" className="flex items-center gap-2">
          <ChevronLeft />
          เนื้อหาทั้งหมด
        </Link>
      </div>
      <div className="flex gap-4 items-start">
        <LessonScore />
        <div className="flex flex-col flex-1">
          <p>
            {lesson?.unit?.course?.name} / {lesson?.unit?.name}
          </p>
          <h1 className="text-2xl">{lesson?.name}</h1>

          <div className="flex items-center gap-2 mt-4">
            <LessonStart />
          </div>
        </div>
        <LessonReward xp={lesson.XPgiven} gems={lesson.gemsGiven} />
      </div>
      <div className="flex gap-4">
        <LessonHistory />
        <div className="flex-1">
          <h3 className="text-lg text-center">สถิติการเรียน (DEMO)</h3>
          <PieChart
            data={[
              {
                name: "Completed",
                value: 30,
                fill: "var(--color-success)",
              },
              {
                name: "In Progress",
                value: 50,
                fill: "#8884d8",
              },
              {
                name: "Failed",
                value: 20,
                fill: "var(--color-danger)",
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
