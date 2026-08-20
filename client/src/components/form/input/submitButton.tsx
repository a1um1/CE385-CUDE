import Button from "#/components/button";
import type { ButtonProps } from "#/components/button/button";
import { Loader2 } from "lucide-react";
import { useFormContext } from "../form";

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
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {label}
          </Button>
        );
      }}
    </form.Subscribe>
  );
}
