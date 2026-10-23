import { Eye, PenTool } from "lucide-react";
import clsx from "clsx";
import styles from "../markdownEditor.module.css";
import { useMarkdownEditor } from "../editorContext";

export function WindowToggleActions() {
  const { showEditor, showPreview, toggleEditorWindow, togglePreviewWindow } = useMarkdownEditor();

  return (
    <div className={styles["toolbar-group"]}>
      <button
        type="button"
        className={clsx(
          styles["toolbar-btn"],
          styles["toolbar-icon-btn"],
          showEditor && styles.active,
        )}
        title="Toggle Editor Window"
        onClick={toggleEditorWindow}
      >
        <PenTool size={15} />
      </button>
      <button
        type="button"
        className={clsx(
          styles["toolbar-btn"],
          styles["toolbar-icon-btn"],
          showPreview && styles.active,
        )}
        title="Toggle Preview Window"
        onClick={togglePreviewWindow}
      >
        <Eye size={15} />
      </button>
    </div>
  );
}
