import { handleFormMutationError, useAppForm } from "#/components/form";
import { useUpdatePassword } from "#/data/user.data";
import { getPasswordError } from "#/lib/passwordRules";

export default function UpdatePasswordForm() {
  const updateMutation = useUpdatePassword();
  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    } as Parameters<typeof updateMutation.mutateAsync>[0],
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync(value);
      } catch (error) {
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Update Password</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 flex-1"
      >
        <form.AppForm>
          <form.FormError />
          <form.AppField name="currentPassword">
            {(field) => (
              <field.TextField
                label="Current Password"
                type="password"
                disabled={updateMutation.isPending}
              />
            )}
          </form.AppField>

          <form.AppField
            name="newPassword"
            validators={{
              onChange: ({ value }) => getPasswordError(value),
            }}
          >
            {(field) => (
              <field.PasswordField
                label="New Password"
                autoComplete="new-password"
                showStrength
                showRequirements
                disabled={updateMutation.isPending}
              />
            )}
          </form.AppField>

          <form.SubmitButton label="Update Password" isPending={updateMutation.isPending} />
        </form.AppForm>
      </form>
    </>
  );
}
