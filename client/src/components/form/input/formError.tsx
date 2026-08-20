import { useFormContext } from "../form";
import styles from "../form.module.css";

export function FormError() {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
      {(globalError) => {
        if (!globalError) return null;
        return (
          <div className={styles["global-error"]} role="alert">
            {Array.isArray(globalError) ? globalError.join(", ") : String(globalError)}
          </div>
        );
      }}
    </form.Subscribe>
  );
}
