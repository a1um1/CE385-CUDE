import type * as React from "react";
import clsx from "clsx";
import styles from "../markdownEditor.module.css";
import { useMarkdownEditor } from "../editorContext";

export interface ToolbarActionProps {
  id: string;
  render: React.ComponentType;
}

export function ToolbarButton({
  active = false,
  disabled = false,
  title,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { disabled: editorDisabled, showEditor } = useMarkdownEditor();
  const isDisabled = disabled || editorDisabled || !showEditor;

  return (
    <button
      type="button"
      className={clsx(
        styles["toolbar-btn"],
        styles["toolbar-icon-btn"],
        active && styles.active,
        className,
      )}
      title={title}
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
