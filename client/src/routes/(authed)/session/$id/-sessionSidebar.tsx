import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import {
  CollapsibleSidebar,
  CollapsibleSidebarFooter,
  CollapsibleSidebarLabel,
  useCollapsibleSidebar,
} from "#/components/collapsibleSidebar";
import Divider from "#/components/divider";
import Skeleton from "#/components/skeleton";
import UserTrigger from "#/components/userTrigger";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { useParams } from "@tanstack/react-router";
import { BookIcon, DoorOpenIcon, FrownIcon, XIcon } from "lucide-react";
import { useState } from "react";

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
  const [abortOpen, setAbortOpen] = useState(false);
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
        <Button
          variant="danger"
          block
          align={align}
          onClick={() => setAbortOpen(true)}
          disabled={isAborting}
          title="ยอมแพ้"
          radius="square"
        >
          <XIcon />
          <CollapsibleSidebarLabel>ยอมแพ้</CollapsibleSidebarLabel>
        </Button>
        <ConfirmDialog
          open={abortOpen}
          onOpenChange={setAbortOpen}
          title="ยอมแพ้บทเรียนนี้?"
          description="เซสชันนี้จะถูกยกเลิก คะแนนที่ทำไว้จะไม่ถูกนับ และคุณจะเริ่มบทเรียนนี้ใหม่ได้"
          icon={<FrownIcon size="2rem" />}
          quote="“ยอมแพ้ไม่ใช่ความล้มเหลว แต่คือการให้โอกาสตัวเองเริ่มต้นใหม่”"
          confirmLabel="ยอมแพ้"
          cancelLabel="ทำต่อ"
          variant="danger"
          onConfirm={() => {
            setAbortOpen(false);
            onAbort();
          }}
          isPending={isAborting}
        />
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
