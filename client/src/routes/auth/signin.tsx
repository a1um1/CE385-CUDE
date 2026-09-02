import { useAppForm, handleFormMutationError } from "#/components/form";
import { useSignIn } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const signInMutation = useSignIn();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } as Parameters<typeof signInMutation.mutateAsync>[0],
    onSubmit: async ({ value }) => {
      try {
        await signInMutation.mutateAsync(value);
        alert("Sign-in successful!");
      } catch (error) {
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Sign In</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 w-full max-w-sm px-4"
      >
        <form.AppForm>
          <form.FormError />
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                required
                type="email"
                disabled={signInMutation.isPending}
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                required
                type="password"
                disabled={signInMutation.isPending}
              />
            )}
          </form.AppField>

          <form.SubmitButton
            label="Sign In"
            isPending={signInMutation.isPending}
            block
            className="mt-2"
          />
        </form.AppForm>
      </form>
    </div>
  );
}
