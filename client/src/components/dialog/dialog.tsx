import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./dialog.module.css";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Optional icon in a round badge above the title; centres the dialog. */
  icon?: ReactNode;
  /** Optional line under the description, e.g. a quote. */
  quote?: string;
  tone?: "default" | "danger";
  children?: ReactNode;
  footer?: ReactNode;
}

function Dialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  quote,
  tone = "default",
  children,
  footer,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Popup
          className={styles.popup}
          data-tone={tone}
          data-with-icon={icon ? "" : undefined}
        >
          <div className={styles.header}>
            {icon && <div className={styles.iconBadge}>{icon}</div>}
            <div className={styles.headerText}>
              <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
              {description && (
                <BaseDialog.Description className={styles.description}>
                  {description}
                </BaseDialog.Description>
              )}
              {quote && <p className={styles.quote}>{quote}</p>}
            </div>
            <BaseDialog.Close className={styles.closeButton} aria-label="Close dialog">
              <X size="1.25rem" />
            </BaseDialog.Close>
          </div>

          {children && <div className={styles.body}>{children}</div>}

          {footer && <div className={styles.footer}>{footer}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

Dialog.displayName = "Dialog";

export default Dialog;
