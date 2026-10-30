import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Dropdown from "#/components/dropdown";
import styles from "../markdownEditor.module.css";
import { useMarkdownEditor } from "../editorContext";

export function AlertNoteAction() {
  const { currentAlert, setAlert, disabled, showEditor } = useMarkdownEditor();

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className={clsx(
          styles["toolbar-btn"],
          styles["toolbar-dropdown-btn"],
          currentAlert !== "None" && styles.active,
        )}
        disabled={disabled || !showEditor}
      >
        <span>{currentAlert === "None" ? "Insert Note" : currentAlert}</span>
        <ChevronDown size={12} />
      </Dropdown.Trigger>
      <Dropdown.Content className={styles["dropdown-menu"]}>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("Note")}>
          Note
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("Tip")}>
          Tip
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("Warning")}>
          Warning
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("Caution")}>
          Caution
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("Important")}>
          Important
        </Dropdown.Item>
        {currentAlert !== "None" && (
          <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("None")}>
            Remove note
          </Dropdown.Item>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
