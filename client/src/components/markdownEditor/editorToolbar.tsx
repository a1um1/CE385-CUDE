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
import type { AlertType, HeadingType } from "./editorActions";

export interface EditorToolbarProps {
  disabled: boolean;
  showEditor: boolean;
  showPreview: boolean;
  currentHeading: HeadingType;
  currentAlert: AlertType;
  isBold: boolean;
  isItalic: boolean;
  isMath: boolean;
  isCode: boolean;
  isList: boolean;
  isNumList: boolean;
  isQuote: boolean;
  onSetHeading: (type: HeadingType) => void;
  onSetAlert: (type: AlertType) => void;
  onToggleInline: (wrap: string, defaultText?: string) => void;
  onToggleLinePrefix: (prefix: string, isActive: boolean) => void;
  onInsertBlock: (block: string) => void;
  onToggleEditorWindow: () => void;
  onTogglePreviewWindow: () => void;
}

export function EditorToolbar({
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
  onSetHeading,
  onSetAlert,
  onToggleInline,
  onToggleLinePrefix,
  onInsertBlock,
  onToggleEditorWindow,
  onTogglePreviewWindow,
}: EditorToolbarProps) {
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
              onClick={() => onSetHeading("Heading 1")}
            >
              Heading 1
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => onSetHeading("Heading 2")}
            >
              Heading 2
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => onSetHeading("Heading 3")}
            >
              Heading 3
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => onSetHeading("Heading 4")}
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
          onClick={() => onToggleInline("**", "bold text")}
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
          onClick={() => onToggleInline("*", "italic text")}
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
          onClick={() => onToggleInline("$", "x^2 + y^2 = z^2")}
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
          onClick={() => onToggleInline("`", "code")}
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
          onClick={() => onToggleLinePrefix("- ", isList)}
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
          onClick={() => onToggleLinePrefix("1. ", isNumList)}
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
          onClick={() => onToggleLinePrefix("> ", isQuote)}
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          className={clsx(styles["toolbar-btn"], styles["toolbar-icon-btn"])}
          title="Link"
          disabled={disabled || !showEditor}
          onClick={() => onToggleInline("[", "](https://example.com)")}
        >
          <Link size={15} />
        </button>
        <button
          type="button"
          className={clsx(styles["toolbar-btn"], styles["toolbar-icon-btn"])}
          title="Table"
          disabled={disabled || !showEditor}
          onClick={() =>
            onInsertBlock(
              "| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |",
            )
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
            <Dropdown.Item className={styles["dropdown-item"]} onClick={() => onSetAlert("Note")}>
              Note
            </Dropdown.Item>
            <Dropdown.Item className={styles["dropdown-item"]} onClick={() => onSetAlert("Tip")}>
              Tip
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => onSetAlert("Warning")}
            >
              Warning
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => onSetAlert("Caution")}
            >
              Caution
            </Dropdown.Item>
            <Dropdown.Item
              className={styles["dropdown-item"]}
              onClick={() => onSetAlert("Important")}
            >
              Important
            </Dropdown.Item>
            {currentAlert !== "None" && (
              <Dropdown.Item className={styles["dropdown-item"]} onClick={() => onSetAlert("None")}>
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
          onClick={onToggleEditorWindow}
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
          onClick={onTogglePreviewWindow}
        >
          <Eye size={15} />
        </button>
      </div>
    </div>
  );
}
