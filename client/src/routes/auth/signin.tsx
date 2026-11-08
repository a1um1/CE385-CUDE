import { useAppForm } from "#/components/form";
import { useSignIn } from "#/data/user.data";
import type { ExtractRequestBody } from "#/data/base/apiUtils.type";
import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./auth.module.css";

type SignInValues = ExtractRequestBody<"/v1/auth/signin", "post">;

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
    } satisfies SignInValues,
    onSubmit: async ({ value }) => {
      // Validation errors are mapped by useAppForm; other errors are toasted by the global MutationCache.
      await signInMutation.mutateAsync(value);
      await navigate({ to: "/" });
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
