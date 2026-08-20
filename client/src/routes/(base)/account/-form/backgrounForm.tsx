import Avatar from "#/components/avatar";
import { handleFormMutationError, useAppForm } from "#/components/form";
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
        alert("Background updated successfully!");
      } catch (error) {
        console.error("Sign-in failed:", error);
        handleFormMutationError(form, error);
      }
    },
  });

  return (
    <>
      <h2 className="text-2xl font-italic mb-4">Change Background</h2>
      <div className="flex gap-6 flex-wrap">
        <div>
          <img
            src={form.getFieldValue("backgroundImageURL")}
            alt="Background Preview"
            className="max-w-xs aspect-video rounded-lg object-cover"
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
                <field.TextField
                  label="Background Image URL"
                  type="text"
                  disabled={updateMutation.isPending}
                />
              )}
            </form.AppField>

            <form.SubmitButton
              label="Update Background"
              loadingLabel="Updating Background..."
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
