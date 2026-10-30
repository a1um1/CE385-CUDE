import Button from "#/components/button";
import type { ButtonProps } from "#/components/button";
import { useFormContext, useFormPending } from "../form";
import Spinner from "#/components/spinner";

export interface SubmitButtonProps extends Omit<ButtonProps, "disabled"> {
  label: string;
}

export function SubmitButton({ label, ...props }: SubmitButtonProps) {
  const form = useFormContext();
  const pending = useFormPending();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => {
        const loading = isSubmitting || pending;
        return (
          <Button type="submit" {...props} disabled={!canSubmit || loading}>
            {loading && <Spinner size="1rem" />}
            {label}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
