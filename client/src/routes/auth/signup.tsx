import { useAppForm, handleFormMutationError } from "#/components/form";
import { useSignUp } from "#/data/user.data";
import { getPasswordError } from "#/lib/passwordRules";
import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./auth.module.css";
import Logo from "#/components/logo";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const signUpMutation = useSignUp();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await signUpMutation.mutateAsync(value);
        navigate({ to: "/auth/signin" });
      } catch (error) {
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <>
      <h1 className={styles.heading}>Sign Up</h1>
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
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                label="Username"
                required
                type="text"
                disabled={signUpMutation.isPending}
                size="lg"
              />
            )}
          </form.AppField>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                required
                type="text"
                disabled={signUpMutation.isPending}
                size="lg"
              />
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
              <field.TextField
                label="Email"
                required
                type="email"
                disabled={signUpMutation.isPending}
                size="lg"
              />
            )}
          </form.AppField>

          <form.AppField
            name="password"
            validators={{
              onChange: ({ value }) => getPasswordError(value),
            }}
          >
            {(field) => (
              <field.PasswordField
                label="Password"
                required
                autoComplete="new-password"
                showStrength
                showRequirements
                disabled={signUpMutation.isPending}
                size="lg"
              />
            )}
          </form.AppField>

          <form.SubmitButton label="Sign Up" size="lg" block className={styles.submitButton} />
        </form.AppForm>
        <Link to="/auth/signin">Already have an account? Sign In</Link>
      </form>
    </>
  );
}
