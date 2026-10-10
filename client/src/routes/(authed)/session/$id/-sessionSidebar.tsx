import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import {
  CollapsibleSidebar,
  CollapsibleSidebarFooter,
  CollapsibleSidebarLabel,
  CollapsibleSidebarToggle,
  useCollapsibleSidebar,
} from "#/components/collapsibleSidebar";
import Divider from "#/components/divider";
import Skeleton from "#/components/skeleton";
import UserTrigger from "#/components/userTrigger";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { useParams } from "@tanstack/react-router";
import { BookIcon, DoorOpenIcon, XIcon } from "lucide-react";

interface SessionSidebarProps {
  sessionId: string;
  lessonId?: string;
  onAbort: () => void;
  isAborting?: boolean;
}

function SessionSidebarBody({ sessionId, lessonId, onAbort, isAborting }: SessionSidebarProps) {
  const { collapsed } = useCollapsibleSidebar();
  const exercises = useExerciseFromLessonQuery(lessonId);
  const { exerciseId } = useParams({ strict: false }) as { exerciseId?: string };
  // left-aligned in both states so icons keep the same position when the sidebar collapses
  const align = "start";

  return (
    <>
      <ButtonLink
        to="/"
        variant="secondary"
        block
        align={align}
        title="ออกจากเนื้อหา"
        radius="square"
      >
        <DoorOpenIcon />
        <CollapsibleSidebarLabel>ออกจากเนื้อหาชั่วคราว</CollapsibleSidebarLabel>
      </ButtonLink>
      <Divider />
      <div>
        {exercises.isLoading && <Skeleton className="h-10 m-1" />}
        {exercises.data?.map((exercise) => (
          <ButtonLink
            key={exercise.id}
            to="/session/$id/$exerciseId"
            params={{ id: sessionId, exerciseId: exercise.id }}
            variant={exerciseId === exercise.id ? "primary" : "ghost"}
            block
            align={align}
            title={exercise.name}
            radius="square"
          >
            <BookIcon />
            <CollapsibleSidebarLabel>{exercise.name}</CollapsibleSidebarLabel>
          </ButtonLink>
        ))}
      </div>
      <CollapsibleSidebarFooter>
        <CollapsibleSidebarToggle label="ย่อแถบ" />
        <Button
          variant="danger"
          block
          align={align}
          onClick={onAbort}
          disabled={isAborting}
          title="ละทิ้ง"
          radius="square"
        >
          <XIcon />
          <CollapsibleSidebarLabel>ละทิ้ง</CollapsibleSidebarLabel>
        </Button>
        <div className={collapsed ? "p-2" : "p-4"}>
          <UserTrigger showFullInfo={!collapsed} />
        </div>
      </CollapsibleSidebarFooter>
    </>
  );
}

export default function SessionSidebar(props: SessionSidebarProps) {
  return (
    <CollapsibleSidebar>
      <SessionSidebarBody {...props} />
    </CollapsibleSidebar>
  );
}
