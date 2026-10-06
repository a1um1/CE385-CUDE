import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import UserTrigger from "#/components/userTrigger";
import { useAbortLearnSessionMutation } from "#/data/learnSession.data";
import { createFileRoute } from "@tanstack/react-router";
import { DoorOpenIcon, XIcon } from "lucide-react";

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const abortSession = useAbortLearnSessionMutation();
  const handleAbortSession = async () => {
    await abortSession.mutateAsync(id);
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
      <div className="container p-4">
        <h1 className="text-3xl font-semibold">Session Content Here</h1>
      </div>
    </div>
  );
}
