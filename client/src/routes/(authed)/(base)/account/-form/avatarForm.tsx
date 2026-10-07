import Avatar from "#/components/avatar";
import { handleFormMutationError, useAppForm } from "#/components/form";
import ImageUploadField from "#/components/imageUploadField";
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
      } catch (error) {
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <>
      <div className="flex gap-6 flex-wrap">
        <Avatar avatarUrl={form.getFieldValue("profileImageURL")} name={user?.name} size="8rem" />
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
                <ImageUploadField
                  purpose="avatar"
                  aspect={1}
                  maxDim={512}
                  targetBytes={150 * 1024}
                  value={field.state.value}
                  disabled={updateMutation.isPending}
                  onUploaded={(url) => field.handleChange(url)}
                />
              )}
            </form.AppField>

            <form.SubmitButton label="Update Avatar" isPending={updateMutation.isPending} />
          </form.AppForm>
        </form>
      </div>
    </>
  );
}
