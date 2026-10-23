import clsx from "clsx";
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Link,
  Table,
  Eye,
  PenTool,
  Sigma,
  ChevronDown,
} from "lucide-react";
import Dropdown from "#/components/dropdown";
import styles from "./markdownEditor.module.css";
import { useMarkdownEditor } from "./editorContext";

export function EditorToolbar() {
  const {
    disabled,
    showEditor,
    showPreview,
    currentHeading,
    currentAlert,
    isBold,
    isItalic,
    isMath,
    isCode,
    isList,
    isNumList,
    isQuote,
    setHeading,
    setAlert,
    toggleInline,
    toggleLinePrefix,
    insertBlock,
    toggleEditorWindow,
    togglePreviewWindow,
  } = useMarkdownEditor();

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Markdown Editor Toolbar">
      <div className={styles["toolbar-group"]}>
        {/* Headings */}
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
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => setHeading("Heading 1")}
            >
              Heading 1
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => setHeading("Heading 2")}
            >
              Heading 2
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => setHeading("Heading 3")}
            >
              Heading 3
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => setHeading("Heading 4")}
            >
              Heading 4
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>

        {/* Inline formatting */}
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isBold && styles.active,
          )}
          title="Bold (**text**)"
          disabled={disabled || !showEditor}
          onClick={() => toggleInline("**", "bold text")}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isItalic && styles.active,
          )}
          title="Italic (*text*)"
          disabled={disabled || !showEditor}
          onClick={() => toggleInline("*", "italic text")}
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isMath && styles.active,
          )}
          title="Math ($formula$)"
          disabled={disabled || !showEditor}
          onClick={() => toggleInline("$", "x^2 + y^2 = z^2")}
        >
          <Sigma size={15} />
        </button>
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isCode && styles.active,
          )}
          title="Inline code (`code`)"
          disabled={disabled || !showEditor}
          onClick={() => toggleInline("`", "code")}
        >
          <Code size={15} />
        </button>

        {/* Lists & Quotes */}
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isList && styles.active,
          )}
          title="Bullet list (- )"
          disabled={disabled || !showEditor}
          onClick={() => toggleLinePrefix("- ", isList)}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isNumList && styles.active,
          )}
          title="Numbered list (1. )"
          disabled={disabled || !showEditor}
          onClick={() => toggleLinePrefix("1. ", isNumList)}
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          className={clsx(
            styles["toolbar-btn"],
            styles["toolbar-icon-btn"],
            isQuote && styles.active,
          )}
          title="Quote (> )"
          disabled={disabled || !showEditor}
          onClick={() => toggleLinePrefix("> ", isQuote)}
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          className={clsx(styles["toolbar-btn"], styles["toolbar-icon-btn"])}
          title="Link"
          disabled={disabled || !showEditor}
          onClick={() => toggleInline("[", "](https://example.com)")}
        >
          <Link size={15} />
        </button>
        <button
          type="button"
          className={clsx(styles["toolbar-btn"], styles["toolbar-icon-btn"])}
          title="Table"
          disabled={disabled || !showEditor}
          onClick={() =>
            insertBlock("| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |")
          }
        >
          <Table size={15} />
        </button>

        {/* Alert Notes */}
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
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => setAlert("Important")}
            >
              Important
            </Dropdown.Item>
            {currentAlert !== "None" && (
              <Dropdown.Item className={styles["dropdown-item"]} onClick={() => setAlert("None")}>
                Remove note
              </Dropdown.Item>
            )}
          </Dropdown.Content>
        </Dropdown.Root>
      </div>

      {/* Window toggle icon buttons */}
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
    </div>
  );
}
