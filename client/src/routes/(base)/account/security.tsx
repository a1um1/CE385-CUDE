import UpdatePasswordForm from "#/routes/(base)/account/-form/passwordForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/account/security")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <UpdatePasswordForm />
    </div>
  );
}
