import Avatar from "#/components/avatar";
import { handleFormMutationError, useAppForm } from "#/components/form";
import { useUpdateAvatar, useUser } from "#/data/user.data";

export default function AvatarForm() {
  const { data: user } = useUser();
  const updateMutation = useUpdateAvatar();
  const form = useAppForm({
    defaultValues: {
      profileImageURL: user?.profileImage || "",
    } as Parameters<typeof updateMutation.mutateAsync>[0],
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync(value);
        alert("Avatar updated successfully!");
      } catch (error) {
        console.error("Sign-in failed:", error);
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <>
      <h2 className="text-2xl font-italic mb-4">Change Avatar</h2>
      <div className="flex gap-6 flex-wrap">
        <Avatar avatarUrl={form.getFieldValue("profileImageURL")} name={user?.name} size="12rem" />
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
            <form.AppField name="profileImageURL">
              {(field) => (
                <field.TextField
                  label="Profile Image URL"
                  type="text"
                  disabled={updateMutation.isPending}
                />
              )}
            </form.AppField>

            <form.SubmitButton
              label="Update Avatar"
              loadingLabel="Updating Avatar..."
              isPending={updateMutation.isPending}
              block
              className="mt-2"
            />
          </form.AppForm>
        </form>
      </div>
    </>
  );
}
