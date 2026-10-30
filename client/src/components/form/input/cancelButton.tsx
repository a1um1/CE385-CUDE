import Button from "#/components/button";
import type { ButtonProps } from "#/components/button";
import { useFormCancel } from "../formPrompt";
import { LeavePrompt } from "./leavePrompt";

export interface CancelButtonProps extends Omit<ButtonProps, "onClick"> {
  fallbackUrl: string;
  label?: string;
}

export function CancelButton({ fallbackUrl, label = "Cancel", ...props }: CancelButtonProps) {
  const handleCancel = useFormCancel(fallbackUrl);

  return (
    <>
      <LeavePrompt />
      <Button type="button" variant="secondary" onClick={handleCancel} {...props}>
        {label}
      </Button>
    </>
  );
}
