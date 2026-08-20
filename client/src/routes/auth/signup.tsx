import { useAppForm, handleFormMutationError } from "#/components/form";
import { useSignUp } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const signUpMutation = useSignUp();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await signUpMutation.mutateAsync(value);
        alert("Sign-up successful!");
        navigate({ to: "/auth/signin" });
      } catch (error) {
        console.error("Sign-up failed:", error);
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Sign Up</h1>
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
          <form.AppField
            name="name"
            validators={{
              onChange: ({ value }) => (!value ? "Name is required" : undefined),
            }}
          >
            {(field) => (
              <field.TextField label="Name" type="text" disabled={signUpMutation.isPending} />
            )}
          </form.AppField>

          <form.AppField
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Email is required";
                if (!value.includes("@")) return "Invalid email address";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.TextField label="Email" type="email" disabled={signUpMutation.isPending} />
            )}
          </form.AppField>

          <form.AppField
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                disabled={signUpMutation.isPending}
              />
            )}
          </form.AppField>

          <form.SubmitButton
            label="Sign Up"
            loadingLabel="Signing Up..."
            isPending={signUpMutation.isPending}
            block
            className="mt-2"
          />
        </form.AppForm>
      </form>
    </div>
  );
}
