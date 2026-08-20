import Button from "#/components/button";
import { useFormContext } from "../form";

export interface SubmitButtonProps extends Omit<ButtonProps, "disabled"> {
  label: string;
  loadingLabel?: string;
  isPending?: boolean;
}

export function SubmitButton({ label, loadingLabel, isPending, ...props }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => {
        const loading = isSubmitting || isPending;
        return (
          <Button type="submit" {...props} disabled={!canSubmit || loading}>
            {loading ? (loadingLabel ?? "Submitting...") : label}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
