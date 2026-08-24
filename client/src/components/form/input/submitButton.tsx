import Button from "#/components/button";
import type { ButtonProps } from "#/components/button/button";
import { useFormContext } from "../form";
import Spinner from "#/components/spinner";

export interface SubmitButtonProps extends Omit<ButtonProps, "disabled"> {
  label: string;
  isPending?: boolean;
}

export function SubmitButton({ label, isPending, ...props }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => {
        const loading = isSubmitting || isPending;
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
