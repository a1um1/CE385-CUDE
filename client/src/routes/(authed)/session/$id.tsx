import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import CodeEditor from "#/components/codeEditor";
import Markdown from "#/components/markdown";
import Skeleton from "#/components/skeleton";
import UserTrigger from "#/components/userTrigger";
import { useCourseById } from "#/data/course.data";
import { sessionByIdQuery, useAbortLearnSessionMutation } from "#/data/learnSession.data";
import { useLesson } from "#/data/lesson.data";
import { useUnitById } from "#/data/unit.data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookIcon, DoorOpenIcon, XIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const lesson = await context.queryClient.query(sessionByIdQuery(params.id));
    return lesson;
  },
});

// const _DEMO_CONTENT = `# Welcome to the Demo Lesson

// เนื้อหาชั่วคราวนี้เป็นเพียงตัวอย่างเพื่อแสดงการทำงานของระบบเรียนรู้ของเรา คุณสามารถใช้เนื้อหานี้เพื่อทดลองฟีเจอร์ต่าง ๆ ของแพลตฟอร์ม

// ## Code Snippets สามารถแสดงโค้ดได้เช่นกัน

// \`\`\`javascript
// console.log("Hello, world!");
// \`\`\`

// > [!note]
// > This is note. You can use notes to highlight important information.\\
// > Note เพิ่มเติมความสำคัญให้กับเนื้อหาที่คุณต้องการเน้น

// ## Images เพิ่มรูปได้นะ

// ![Sample Image](https://github.com/vyrx-dev/Wallpapers/raw/master/nord/a_cartoon_of_a_woman_with_her_arms_out.png)

// Enjoy your learning experience!
// `;

const DEMO_CONTENT_2 = `# Exercise 0 Hello World

This is a simple exercise to get you started with coding. Your task is to write a program that prints "Hello, World!" to the console.

## Instructions

1. Open the code editor on the right.
2. Write your code in the editor.
3. Click the "Run" button to execute your code and see the output.


## Allowed Functions
\`Print\`


## Expected Output
\`\`\`
Hello, World!
\`\`\`

> [!note]
> Make sure that output matches exactly, including capitalization and punctuation.
 
Good luck!
`;

const exampleCode = `# Write your code here
`;

const exampleExercises = [
  {
    id: "exercise0",
    title: "Welcome to the Demo Lesson",
  },
  {
    id: "exercise1",
    title: "Exercise 1",
  },
  {
    id: "exercise2",
    title: "Exercise 2",
  },
];

function RouteComponent() {
  const data = Route.useLoaderData();
  const lesson = useLesson(data?.LessonID);
  const unit = useUnitById(lesson?.data?.unitID);
  const course = useCourseById(unit?.data?.courseID);

  const [codeContent, setCodeContent] = useState(exampleCode);
  const handleCodeChange = (newCode: string) => {
    setCodeContent(newCode);
  };
  const abortSession = useAbortLearnSessionMutation();
  const handleAbortSession = async () => {
    await abortSession.mutateAsync(data.id);
  };

  return (
    <div className="flex h-dvh">
      <div className="w-64 shrink-0 border-r-2 flex flex-col">
        <ButtonLink to="/" variant="secondary" block align="start">
          <DoorOpenIcon />
          ออกจากเนื้อหาชั่วคราว
        </ButtonLink>
        <div className="border-t-2">
          {exampleExercises.map((exercise) => (
            <Button key={exercise.id} variant="ghost" block align="start">
              <BookIcon />
              {exercise.title}
            </Button>
          ))}
          <Button variant="ghost" block align="start">
            <BookIcon />
            Summary
          </Button>
        </div>
        <div className="mt-auto flex flex-col">
          <Button
            variant="danger"
            block
            onClick={handleAbortSession}
            disabled={abortSession.isPending}
            align="start"
          >
            <XIcon />
            ละทิ้ง
          </Button>
          <div className="p-4">
            <UserTrigger showFullInfo />
          </div>
        </div>
      </div>
      <div className="h-full overflow-y-auto flex-1">
        <div className="container p-4">
          {lesson?.data?.id ? (
            <Link to="/lesson/$lessonId" params={{ lessonId: lesson?.data?.id || "" }}>
              {course?.data?.name} | {unit?.data?.name} | {lesson?.data?.name}
            </Link>
          ) : (
            <Skeleton className="w-48 h-6" />
          )}
          <hr className="my-4" />
          <Markdown content={DEMO_CONTENT_2} />
        </div>
      </div>
      <div className="flex-1">
        <CodeEditor
          value={codeContent}
          onChange={handleCodeChange}
          language="python"
          disableLanguageSwitch
        />
      </div>
    </div>
  );
}
