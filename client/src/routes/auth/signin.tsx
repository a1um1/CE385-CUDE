import { useAppForm, handleFormMutationError } from "#/components/form";
import { useSignIn } from "#/data/user.data";
import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./auth.module.css";
import Logo from "#/components/logo";

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
    <>
      <h1 className={styles.heading}>Sign In into platform</h1>
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
                size="lg"
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
                size="lg"
                disabled={signInMutation.isPending}
              />
            )}
          </form.AppField>
          <form.SubmitButton label="Sign In" size="lg" className={styles.submitButton} />
        </form.AppForm>
        <Link to="/auth/signup">Don't have an account? Sign Up</Link>
      </form>
    </>
  );
}
