import { useEffect, useRef } from "react";
import { useAppForm, useFormMutationErrors } from "#/components/form";
import { useSignIn } from "#/data/user.data";
import type { ExtractRequestBody } from "#/data/base/apiUtils.type";
import type { AnyFormApi } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import styles from "./auth.module.css";

type SignInValues = ExtractRequestBody<"/auth/signin", "post">;

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const formRef = useRef<AnyFormApi | null>(null);
  const { onError } = useFormMutationErrors(() => formRef.current);
  const signInMutation = useSignIn({ onError });
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies SignInValues,
    onSubmit: async ({ value }) => {
      const user = await signInMutation.mutateAsync(value).catch(() => null);
      if (user) await navigate({ to: "/" });
    },
  });

  useEffect(() => {
    formRef.current = form;
  }, [form]);

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
