import { handleFormMutationError, useAppForm } from "#/components/form";
import { useUpdatePassword } from "#/data/user.data";

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
      <div className="flex gap-6 flex-wrap">
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

            <form.AppField name="newPassword">
              {(field) => (
                <field.TextField
                  label="New Password"
                  type="password"
                  disabled={updateMutation.isPending}
                />
              )}
            </form.AppField>

            <form.SubmitButton label="Update Password" isPending={updateMutation.isPending} />
          </form.AppForm>
        </form>
      </div>
    </>
  );
}
