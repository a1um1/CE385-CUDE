import { useAppForm, handleFormMutationError } from "#/components/form";
import { useAdminChangeUserPassword } from "#/data/admin/user.data";
import Button from "#/components/button";
import Dialog from "#/components/dialog";

export interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

function ChangePasswordDialog({ open, onOpenChange, userId }: ChangePasswordDialogProps) {
  const { mutateAsync } = useAdminChangeUserPassword();

  const form = useAppForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        if (value.newPassword !== value.confirmPassword) {
          return {
            fields: {
              confirmPassword: "Passwords do not match",
            },
          };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ id: userId, newPassword: value.newPassword });
        formApi.reset();
        onOpenChange(false);
      } catch (error) {
        handleFormMutationError(formApi, error);
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Change Password"
      description="Set a new password for this user."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppForm>
          <form.FormError />
          <form.AppField name="newPassword">
            {(field) => (
              <field.TextField label="New Password" type="password" autoComplete="new-password" />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
              />
            )}
          </form.AppField>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <form.SubmitButton label="Change Password" />
                </>
              )}
            </form.Subscribe>
          </div>
        </form.AppForm>
      </form>
    </Dialog>
  );
}

ChangePasswordDialog.displayName = "ChangePasswordDialog";

export default ChangePasswordDialog;
