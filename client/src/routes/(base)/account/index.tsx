import AvatarForm from "#/routes/(base)/account/-form/avatarForm";
import BackgroundForm from "#/routes/(base)/account/-form/backgrounForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/account/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AvatarForm />
      <BackgroundForm />
    </>
  );
}
