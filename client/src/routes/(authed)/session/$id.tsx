import ButtonLink from "#/components/buttonLink";
import UserTrigger from "#/components/userTrigger";
import { createFileRoute } from "@tanstack/react-router";
import { DoorOpenIcon } from "lucide-react";

export const Route = createFileRoute("/(authed)/session/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-dvh">
      <div className="w-64 shrink-0 border-r-2 p-4 flex flex-col">
        <ButtonLink to="/" variant="secondary" block>
          <DoorOpenIcon />
          ออกจากเนื้อหาชั่วคราว
        </ButtonLink>
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
