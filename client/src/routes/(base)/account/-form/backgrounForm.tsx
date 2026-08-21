import { handleFormMutationError, useAppForm } from "#/components/form";
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
        alert("Background updated successfully!");
      } catch (error) {
        console.error("Sign-in failed:", error);
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
                <field.TextField
                  label="Background Image URL"
                  type="text"
                  disabled={updateMutation.isPending}
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
