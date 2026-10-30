import { useBlocker, useRouter } from "@tanstack/react-router";
import * as React from "react";
import ConfirmDialog from "#/components/dialog/confirmDialog";
import { AlertTriangle } from "lucide-react";

export interface FormLeavePromptProps {
  isDirty?: boolean;
  isSubmitted?: boolean;
  isSubmitting?: boolean;
}

export function FormLeavePrompt({
  isDirty = false,
  isSubmitted = false,
  isSubmitting = false,
}: FormLeavePromptProps) {
  const shouldBlock = Boolean(isDirty && !isSubmitted && !isSubmitting);

  const blocker = useBlocker({
    shouldBlockFn: () => shouldBlock,
    withResolver: true,
    enableBeforeUnload: shouldBlock,
  });

  const isBlocked = blocker.status === "blocked";

  return (
    <ConfirmDialog
      open={isBlocked}
      onOpenChange={(open) => {
        if (!open && isBlocked) {
          blocker.reset?.();
        }
      }}
      icon={<AlertTriangle size="2rem" />}
      title="Unsaved Changes"
      description="Are you sure you want to leave without changes? Your edits will be lost."
      confirmLabel="Leave without saving"
      cancelLabel="Stay"
      variant="danger"
      onConfirm={() => {
        blocker.proceed?.();
      }}
    />
  );
}

export function useFormCancel(fallbackUrl: string) {
  const router = useRouter();

  return React.useCallback(() => {
    if (typeof globalThis.window !== "undefined" && globalThis.window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ href: fallbackUrl });
    }
  }, [router, fallbackUrl]);
}
