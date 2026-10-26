import { useFormContext } from "../form";
import { FormLeavePrompt } from "../formPrompt";

export function LeavePrompt() {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.isDirty, state.isSubmitted, state.isSubmitting]}>
      {([isDirty, isSubmitted, isSubmitting]) => (
        <FormLeavePrompt isDirty={isDirty} isSubmitted={isSubmitted} isSubmitting={isSubmitting} />
      )}
    </form.Subscribe>
  );
}
