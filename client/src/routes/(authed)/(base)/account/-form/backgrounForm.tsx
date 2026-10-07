import { handleFormMutationError, useAppForm } from "#/components/form";
import ImageUploadField from "#/components/imageUploadField";
import UserBackground from "#/components/userBackground";
import { useUpdateBackground, useUser } from "#/data/user.data";

export default function BackgroundForm() {
  const { data: user } = useUser();
  const updateMutation = useUpdateBackground();
  const form = useAppForm({
    defaultValues: {
      backgroundImageURL: user?.backgroundImage || "",
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
        <div className="max-w-xs w-full shrink-0">
          <UserBackground
            backgroundUrl={form.getFieldValue("backgroundImageURL")}
            name={user?.name || ""}
          />
        </div>
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
            <form.AppField name="backgroundImageURL">
              {(field) => (
                <ImageUploadField
                  purpose="background"
                  aspect={32 / 9}
                  maxDim={1600}
                  targetBytes={400 * 1024}
                  value={field.state.value}
                  disabled={updateMutation.isPending}
                  onUploaded={(url) => field.handleChange(url)}
                />
              )}
            </form.AppField>

            <form.SubmitButton label="Update Background" isPending={updateMutation.isPending} />
          </form.AppForm>
        </form>
      </div>
    </>
  );
}
