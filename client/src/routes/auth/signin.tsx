import { useAppForm, handleFormMutationError } from "#/components/form";
import { useSignIn } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./auth.module.css";

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const signInMutation = useSignIn();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } as Parameters<typeof signInMutation.mutateAsync>[0],
    onSubmit: async ({ value }) => {
      try {
        await signInMutation.mutateAsync(value);
        await navigate({ to: "/" });
      } catch (error) {
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Sign In</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className={styles.form}
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

          <form.SubmitButton label="Sign In" block className={styles.submitButton} />
        </form.AppForm>
      </form>
    </div>
  );
}
