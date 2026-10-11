import clsx from "clsx";
import { CheckIcon, XIcon } from "lucide-react";
import { getPasswordRuleResults } from "#/lib/passwordRules";
import styles from "./passwordRequirements.module.css";

export interface PasswordRequirementsProps {
  value: string;
  title?: string;
  className?: string;
}

export function PasswordRequirements({ value, title, className }: PasswordRequirementsProps) {
  const results = getPasswordRuleResults(value);

  return (
    <div className={clsx(styles.wrapper, className)}>
      {title && <p className={styles.title}>{title}</p>}
      <ul className={styles.list} aria-label="Password requirements">
        {results.map(({ rule, satisfied }) => (
          <li
            key={rule.id}
            className={clsx(styles.item, satisfied ? styles.satisfied : styles.unsatisfied)}
          >
            {satisfied ? (
              <CheckIcon className={styles.icon} size={14} strokeWidth={2.5} aria-hidden />
            ) : (
              <XIcon className={styles.icon} size={14} strokeWidth={2.5} aria-hidden />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordRequirements;
