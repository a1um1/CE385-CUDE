import * as React from "react";
import clsx from "clsx";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Table,
  Columns,
  Eye,
  PenTool,
} from "lucide-react";
import Markdown from "#/components/markdown";
import styles from "./markdownEditor.module.css";

export type EditorViewMode = "write" | "preview" | "split";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number | string;
  defaultViewMode?: EditorViewMode;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Write markdown content here...",
  disabled = false,
  minHeight = 300,
  defaultViewMode = "split",
  className,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = React.useState<EditorViewMode>(defaultViewMode);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const applyFormatting = React.useCallback(
    (prefix: string, suffix = "", defaultText = "text") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end) || defaultText;
      const replacement = `${prefix}${selected}${suffix}`;
      const nextValue = value.substring(0, start) + replacement + value.substring(end);

      onChange(nextValue);

      // Restore cursor position
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorStart = start + prefix.length;
        const cursorEnd = cursorStart + selected.length;
        textarea.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [value, onChange],
  );

  const insertLinePrefix = React.useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Find beginning of current line
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const nextValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

      onChange(nextValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      });
    },
    [value, onChange],
  );

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.toolbar} role="toolbar" aria-label="Markdown Editor Toolbar">
        <div className={styles["toolbar-group"]}>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Heading 1"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("# ")}
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Heading 2"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("## ")}
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Heading 3"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("### ")}
          >
            <Heading3 size={15} />
          </button>

          <span className={styles["toolbar-divider"]} />

          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Bold"
            disabled={disabled || viewMode === "preview"}
            onClick={() => applyFormatting("**", "**", "bold text")}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Italic"
            disabled={disabled || viewMode === "preview"}
            onClick={() => applyFormatting("*", "*", "italic text")}
          >
            <Italic size={15} />
          </button>

          <span className={styles["toolbar-divider"]} />

          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Code block"
            disabled={disabled || viewMode === "preview"}
            onClick={() => applyFormatting("```\n", "\n```", "code here")}
          >
            <Code size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Bullet list"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("- ")}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Numbered list"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("1. ")}
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Quote"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("> ")}
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Link"
            disabled={disabled || viewMode === "preview"}
            onClick={() => applyFormatting("[", "](https://)", "link text")}
          >
            <Link size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Table"
            disabled={disabled || viewMode === "preview"}
            onClick={() =>
              applyFormatting("| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |", "", "")
            }
          >
            <Table size={15} />
          </button>
        </div>

        <div className={styles["toolbar-group"]}>
          <button
            type="button"
            className={clsx(styles["toolbar-btn"], viewMode === "write" && styles.active)}
            title="Write mode"
            onClick={() => setViewMode("write")}
          >
            <PenTool size={14} style={{ marginRight: "0.25rem" }} /> Write
          </button>
          <button
            type="button"
            className={clsx(styles["toolbar-btn"], viewMode === "split" && styles.active)}
            title="Split mode"
            onClick={() => setViewMode("split")}
          >
            <Columns size={14} style={{ marginRight: "0.25rem" }} /> Split
          </button>
          <button
            type="button"
            className={clsx(styles["toolbar-btn"], viewMode === "preview" && styles.active)}
            title="Preview mode"
            onClick={() => setViewMode("preview")}
          >
            <Eye size={14} style={{ marginRight: "0.25rem" }} /> Preview
          </button>
        </div>
      </div>

      <div
        className={clsx(
          styles["editor-area"],
          viewMode === "split" && styles["mode-split"],
          viewMode === "write" && styles["mode-write"],
          viewMode === "preview" && styles["mode-preview"],
        )}
        style={{ minHeight }}
      >
        {viewMode !== "preview" && (
          <div className={clsx(styles.pane, styles["write-pane"])}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              style={{ minHeight }}
            />
          </div>
        )}

        {viewMode !== "write" && (
          <div className={clsx(styles.pane, styles["preview-pane"])}>
            {value.trim() ? (
              <Markdown content={value} />
            ) : (
              <div className={styles["preview-empty"]}>Nothing to preview yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkdownEditor;
