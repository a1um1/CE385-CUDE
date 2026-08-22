import Dialog from "./dialog";
import Button from "#/components/button";
import Spinner from "#/components/spinner";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  isPending?: boolean;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isPending}
            style={
              variant === "danger"
                ? {
                    backgroundColor: "var(--color-danger)",
                    color: "var(--color-danger-text)",
                  }
                : undefined
            }
          >
            {isPending && <Spinner className="mr-2" size="1rem" />}
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

ConfirmDialog.displayName = "ConfirmDialog";

export default ConfirmDialog;
