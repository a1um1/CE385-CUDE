import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import Dropdown from "#/components/dropdown";
import styles from "../markdownEditor.module.css";
import { useMarkdownEditor } from "../editorContext";

export function HeadingAction() {
  const { currentHeading, setHeading, disabled, showEditor } = useMarkdownEditor();

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className={clsx(
          styles["toolbar-btn"],
          styles["toolbar-dropdown-btn"],
          currentHeading !== "Paragraph" && styles.active,
        )}
        disabled={disabled || !showEditor}
      >
        <span>{currentHeading}</span>
        <ChevronDown size={12} />
      </Dropdown.Trigger>
      <Dropdown.Content className={styles["dropdown-menu"]}>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setHeading("Heading 1")}>
          Heading 1
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setHeading("Heading 2")}>
          Heading 2
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setHeading("Heading 3")}>
          Heading 3
        </Dropdown.Item>
        <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setHeading("Heading 4")}>
          Heading 4
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
