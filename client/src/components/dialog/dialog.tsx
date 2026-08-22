import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./dialog.module.css";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

function Dialog({ open, onOpenChange, title, description, children, footer }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Popup className={styles.popup}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
              {description && (
                <BaseDialog.Description className={styles.description}>
                  {description}
                </BaseDialog.Description>
              )}
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
