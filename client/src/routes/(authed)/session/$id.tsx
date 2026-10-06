import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import Markdown from "#/components/markdown";
import UserTrigger from "#/components/userTrigger";
import { useCourseById } from "#/data/course.data";
import { sessionByIdQuery, useAbortLearnSessionMutation } from "#/data/learnSession.data";
import { useLesson } from "#/data/lesson.data";
import { useUnitById } from "#/data/unit.data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DoorOpenIcon, XIcon } from "lucide-react";

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(sessionByIdQuery(params.id));
    return lesson;
  },
});

const DEMO_CONTENT = `# Welcome to the Demo Lesson

This is a sample lesson content. You can use **Markdown** to format your text.

- Item 1
- Item 2
- Item 3

## Subheading

You can also include code snippets:

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

> [!note]
> This is note. You can use notes to highlight important information.

## Images

You can add images as well:

![Sample Image](https://github.com/vyrx-dev/Wallpapers/raw/master/nord/a_cartoon_of_a_woman_with_her_arms_out.png)

Enjoy your learning experience!
`;

function RouteComponent() {
  const data = Route.useLoaderData();
  const lesson = useLesson(data?.LessonID);
  const unit = useUnitById(lesson?.data?.unitID);
  const course = useCourseById(unit?.data?.courseID);

  const abortSession = useAbortLearnSessionMutation();
  const handleAbortSession = async () => {
    await abortSession.mutateAsync(data.id);
  };

  return (
    <div className="flex h-dvh">
      <div className="w-64 shrink-0 border-r-2 p-4 flex flex-col gap-4">
        <ButtonLink to="/" variant="secondary" block>
          <DoorOpenIcon />
          ออกจากเนื้อหาชั่วคราว
        </ButtonLink>
        <Button
          variant="danger"
          block
          onClick={handleAbortSession}
          disabled={abortSession.isPending}
        >
          <XIcon />
          ละทิ้ง
        </Button>
        <div className="mt-auto">
          <UserTrigger showFullInfo />
        </div>
      </div>
      <div className="container p-4 h-full overflow-y-auto">
        <Link to="/lesson/$lessonId" params={{ lessonId: lesson?.data?.id || "" }}>
          {course?.data?.name} | {unit?.data?.name} | {lesson?.data?.name}
        </Link>
        <hr className="my-4" />
        <Markdown content={DEMO_CONTENT} />
      </div>
    </div>
  );
}
