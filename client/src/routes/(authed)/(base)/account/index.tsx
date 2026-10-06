import AvatarForm from "#/routes/(authed)/(base)/account/-form/avatarForm";
import BackgroundForm from "#/routes/(authed)/(base)/account/-form/backgrounForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authed)/(base)/account/")({
  component: RouteComponent,
  staticData: {
    pageKey: "profile",
    pageTitle: "Profile",
  },
});

function RouteComponent() {
  return (
    <>
      <AvatarForm />
      <BackgroundForm />
    </>
  );
}
