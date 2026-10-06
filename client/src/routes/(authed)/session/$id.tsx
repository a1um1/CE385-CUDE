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

เนื้อหาชั่วคราวนี้เป็นเพียงตัวอย่างเพื่อแสดงการทำงานของระบบเรียนรู้ของเรา คุณสามารถใช้เนื้อหานี้เพื่อทดลองฟีเจอร์ต่าง ๆ ของแพลตฟอร์ม

## Code Snippets สามารถแสดงโค้ดได้เช่นกัน

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

> [!note]
> This is note. You can use notes to highlight important information.\\
> Note เพิ่มเติมความสำคัญให้กับเนื้อหาที่คุณต้องการเน้น

## Images เพิ่มรูปได้นะ

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
      <div className="h-full overflow-y-auto flex-1">
        <div className="container p-4">
          <Link to="/lesson/$lessonId" params={{ lessonId: lesson?.data?.id || "" }}>
            {course?.data?.name} | {unit?.data?.name} | {lesson?.data?.name}
          </Link>
          <hr className="my-4" />
          <Markdown content={DEMO_CONTENT} />
        </div>
      </div>
    </div>
  );
}
