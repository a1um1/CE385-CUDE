import * as React from "react";
import clsx from "clsx";
import { Editor, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
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
import Markdown from "#/components/markdown";
import Spinner from "#/components/spinner";
import Dropdown from "#/components/dropdown";
import styles from "./markdownEditor.module.css";

export type HeadingType = "Paragraph" | "Heading 1" | "Heading 2" | "Heading 3" | "Heading 4";
export type AlertType = "None" | "Note" | "Tip" | "Warning" | "Caution" | "Important";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  height?: number | string;
  minHeight?: number | string;
  defaultShowEditor?: boolean;
  defaultShowPreview?: boolean;
  className?: string;
}

function detectHeading(trimmed: string): HeadingType {
  if (trimmed.startsWith("#### ")) return "Heading 4";
  if (trimmed.startsWith("### ")) return "Heading 3";
  if (trimmed.startsWith("## ")) return "Heading 2";
  if (trimmed.startsWith("# ")) return "Heading 1";
  return "Paragraph";
}

function detectAlert(trimmed: string): AlertType {
  if (trimmed.startsWith("> [!NOTE]")) return "Note";
  if (trimmed.startsWith("> [!TIP]")) return "Tip";
  if (trimmed.startsWith("> [!WARNING]")) return "Warning";
  if (trimmed.startsWith("> [!CAUTION]")) return "Caution";
  if (trimmed.startsWith("> [!IMPORTANT]")) return "Important";
  return "None";
}

function detectInlineFormat(line: string, col: number, selectedText: string) {
  if (selectedText.length > 0) {
    return {
      bold: selectedText.startsWith("**") && selectedText.endsWith("**"),
      italic:
        (selectedText.startsWith("*") &&
          selectedText.endsWith("*") &&
          !selectedText.startsWith("**")) ||
        (selectedText.startsWith("_") && selectedText.endsWith("_")),
      math: selectedText.startsWith("$") && selectedText.endsWith("$"),
      code: selectedText.startsWith("`") && selectedText.endsWith("`"),
    };
  }

  const before = line.substring(Math.max(0, col - 3), col);
  const after = line.substring(col - 1, Math.min(line.length, col + 2));
  return {
    bold: before.endsWith("**") || after.startsWith("**"),
    italic:
      (before.endsWith("*") && !before.endsWith("**")) ||
      (after.startsWith("*") && !after.startsWith("**")),
    math: before.endsWith("$") || after.startsWith("$"),
    code: before.endsWith("`") || after.startsWith("`"),
  };
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  disabled = false,
  height,
  minHeight = 450,
  defaultShowEditor = true,
  defaultShowPreview = true,
  className,
}: MarkdownEditorProps) {
  const [showEditor, setShowEditor] = React.useState(defaultShowEditor);
  const [showPreview, setShowPreview] = React.useState(defaultShowPreview);
  const editorRef = React.useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const [currentHeading, setCurrentHeading] = React.useState<HeadingType>("Paragraph");
  const [currentAlert, setCurrentAlert] = React.useState<AlertType>("None");
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isMath, setIsMath] = React.useState(false);
  const [isCode, setIsCode] = React.useState(false);
  const [isList, setIsList] = React.useState(false);
  const [isNumList, setIsNumList] = React.useState(false);
  const [isQuote, setIsQuote] = React.useState(false);

  const toggleEditorWindow = React.useCallback(() => {
    setShowEditor((prev) => {
      if (prev && !showPreview) return prev; // Don't close all windows
      return !prev;
    });
  }, [showPreview]);

  const togglePreviewWindow = React.useCallback(() => {
    setShowPreview((prev) => {
      if (prev && !showEditor) return prev; // Don't close all windows
      return !prev;
    });
  }, [showEditor]);

  const updateActiveStates = React.useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;

    const line = model.getLineContent(selection.positionLineNumber);
    const trimmed = line.trimStart();

    setCurrentHeading(detectHeading(trimmed));
    setCurrentAlert(detectAlert(trimmed));
    setIsList(trimmed.startsWith("- ") || trimmed.startsWith("* "));
    setIsNumList(/^\d+\.\s/.test(trimmed));
    setIsQuote(trimmed.startsWith("> ") && !trimmed.startsWith("> [!"));

    const inline = detectInlineFormat(
      line,
      selection.positionColumn,
      model.getValueInRange(selection),
    );
    setIsBold(inline.bold);
    setIsItalic(inline.italic);
    setIsMath(inline.math);
    setIsCode(inline.code);
  }, []);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    if (onBlur) {
      editor.onDidBlurEditorWidget(onBlur);
    }
    editor.onDidChangeCursorPosition(updateActiveStates);
    editor.onDidChangeCursorSelection(updateActiveStates);
  };

  const toggleInlineWrap = React.useCallback(
    (wrap: string, defaultText = "text") => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      const model = editor.getModel();
      if (!selection || !model) return;

      const selected = model.getValueInRange(selection);

      if (
        selected.startsWith(wrap) &&
        selected.endsWith(wrap) &&
        selected.length >= wrap.length * 2
      ) {
        const unwrapped = selected.slice(wrap.length, selected.length - wrap.length);
        editor.executeEdits("markdown-editor", [
          { range: selection, text: unwrapped, forceMoveMarkers: true },
        ]);
      } else {
        const col = selection.startColumn;
        const lineNum = selection.startLineNumber;
        const line = model.getLineContent(lineNum);
        const wLen = wrap.length;
        const left = line.substring(col - 1 - wLen, col - 1);
        const right = line.substring(col - 1, col - 1 + wLen);

        if (selected.length === 0 && left === wrap && right === wrap) {
          editor.executeEdits("markdown-editor", [
            {
              range: {
                startLineNumber: lineNum,
                startColumn: col - wLen,
                endLineNumber: lineNum,
                endColumn: col + wLen,
              },
              text: "",
              forceMoveMarkers: true,
            },
          ]);
        } else {
          editor.executeEdits("markdown-editor", [
            {
              range: selection,
              text: `${wrap}${selected || defaultText}${wrap}`,
              forceMoveMarkers: true,
            },
          ]);
        }
      }

      editor.focus();
      updateActiveStates();
    },
    [updateActiveStates],
  );

  const setHeading = React.useCallback(
    (type: HeadingType) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      const model = editor.getModel();
      if (!selection || !model) return;

      const lineNum = selection.positionLineNumber;
      const lineContent = model.getLineContent(lineNum);
      const cleanLine = lineContent.replace(/^#{1,6}\s*/, "");

      const hashPrefix =
        type === "Heading 1"
          ? "# "
          : type === "Heading 2"
            ? "## "
            : type === "Heading 3"
              ? "### "
              : type === "Heading 4"
                ? "#### "
                : "";

      const newLine =
        type === currentHeading || type === "Paragraph"
          ? cleanLine
          : `${hashPrefix}${cleanLine || "Heading"}`;

      editor.executeEdits("markdown-editor", [
        {
          range: {
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: lineContent.length + 1,
          },
          text: newLine,
          forceMoveMarkers: true,
        },
      ]);

      editor.focus();
      updateActiveStates();
    },
    [currentHeading, updateActiveStates],
  );

  const setAlert = React.useCallback(
    (type: AlertType) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      const model = editor.getModel();
      if (!selection || !model) return;

      const lineNum = selection.positionLineNumber;
      const lineContent = model.getLineContent(lineNum);

      const newLine =
        type === currentAlert || type === "None"
          ? lineContent.replace(/^>\s*\[!(?<type>NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/i, "")
          : `> [!${type.toUpperCase()}]\n> ${lineContent.replace(/^>\s*/, "") || "Content here"}`;

      editor.executeEdits("markdown-editor", [
        {
          range: {
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: lineContent.length + 1,
          },
          text: newLine,
          forceMoveMarkers: true,
        },
      ]);

      editor.focus();
      updateActiveStates();
    },
    [currentAlert, updateActiveStates],
  );

  const toggleLinePrefix = React.useCallback(
    (prefix: string, isCurrentlyActive: boolean) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      const model = editor.getModel();
      if (!selection || !model) return;

      const lineNum = selection.positionLineNumber;
      const line = model.getLineContent(lineNum);

      let newLine = "";
      if (isCurrentlyActive) {
        newLine =
          prefix === "1. "
            ? line.replace(/^\d+\.\s*/, "")
            : line.replace(new RegExp(`^\\${prefix.trim()}\\s*`), "");
      } else {
        const clean = line.replace(/^(?<lead>[-*>]|\d+\.)\s*/, "");
        newLine = `${prefix}${clean || "item"}`;
      }

      editor.executeEdits("markdown-editor", [
        {
          range: {
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: line.length + 1,
          },
          text: newLine,
          forceMoveMarkers: true,
        },
      ]);

      editor.focus();
      updateActiveStates();
    },
    [updateActiveStates],
  );

  const insertBlock = React.useCallback(
    (blockContent: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      if (!selection) return;

      editor.executeEdits("markdown-editor", [
        { range: selection, text: `\n${blockContent}\n`, forceMoveMarkers: true },
      ]);

      editor.focus();
      updateActiveStates();
    },
    [updateActiveStates],
  );

  return (
    <div className={clsx(styles.container, className)} style={{ height, minHeight }}>
      <div className={styles.toolbar} role="toolbar" aria-label="Markdown Editor Toolbar">
        <div className={styles["toolbar-group"]}>
          {/* Headings Dropdown */}
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

          {/* Inline format toggles */}
          <button
            type="button"
            className={clsx(
              styles["toolbar-btn"],
              styles["toolbar-icon-btn"],
              isBold && styles.active,
            )}
            title="Bold (**text**)"
            disabled={disabled || !showEditor}
            onClick={() => toggleInlineWrap("**", "bold text")}
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
            onClick={() => toggleInlineWrap("*", "italic text")}
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
            onClick={() => toggleInlineWrap("$", "x^2 + y^2 = z^2")}
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
            onClick={() => toggleInlineWrap("`", "code")}
          >
            <Code size={15} />
          </button>

          {/* List & Quote Toggles */}
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
            onClick={() => toggleInlineWrap("[", "](https://example.com)")}
          >
            <Link size={15} />
          </button>
          <button
            type="button"
            className={clsx(styles["toolbar-btn"], styles["toolbar-icon-btn"])}
            title="Table"
            disabled={disabled || !showEditor}
            onClick={() =>
              insertBlock(
                "| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |",
              )
            }
          >
            <Table size={15} />
          </button>

          {/* Insert Note Dropdown */}
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
              <Dropdown.Item
                className={styles["dropdown-item"]}
                onClick={() => setAlert("Warning")}
              >
                Warning
              </Dropdown.Item>
              <Dropdown.Item
                className={styles["dropdown-item"]}
                onClick={() => setAlert("Caution")}
              >
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

      <div
        className={clsx(
          styles["editor-area"],
          showEditor && showPreview && styles["split-both"],
          showEditor && !showPreview && styles["only-write"],
          !showEditor && showPreview && styles["only-preview"],
        )}
      >
        {showEditor && (
          <div className={clsx(styles.pane, styles["write-pane"])}>
            <Editor
              height="100%"
              language="markdown"
              theme="vs-dark"
              value={value}
              onChange={(val) => onChange(val ?? "")}
              onMount={handleEditorMount}
              loading={<Spinner />}
              options={{
                readOnly: disabled,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"Geist Mono", monospace',
                wordWrap: "on",
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
                lineNumbers: "on",
              }}
            />
          </div>
        )}

        {showPreview && (
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
