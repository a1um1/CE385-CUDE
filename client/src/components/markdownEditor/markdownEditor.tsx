import * as React from "react";
import clsx from "clsx";
import { Editor, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
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
  Info,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Sigma,
} from "lucide-react";
import Markdown from "#/components/markdown";
import Spinner from "#/components/spinner";
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
  disabled = false,
  minHeight = 400,
  defaultViewMode = "split",
  className,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = React.useState<EditorViewMode>(defaultViewMode);
  const editorRef = React.useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    if (onBlur) {
      editor.onDidBlurEditorWidget(onBlur);
    }
  };

  const applyFormatting = React.useCallback((prefix: string, suffix = "", defaultText = "text") => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;

    const selectedText = model.getValueInRange(selection);
    const textToWrap = selectedText || defaultText;
    const text = `${prefix}${textToWrap}${suffix}`;

    editor.executeEdits("markdown-editor", [
      {
        range: selection,
        text,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  }, []);

  const insertLinePrefix = React.useCallback((prefix: string, defaultText = "text") => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;

    const lineNumber = selection.startLineNumber;
    const lineContent = model.getLineContent(lineNumber);

    if (lineContent.trim().length === 0) {
      editor.executeEdits("markdown-editor", [
        {
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: 1,
          },
          text: `${prefix}${defaultText}`,
          forceMoveMarkers: true,
        },
      ]);
    } else {
      editor.executeEdits("markdown-editor", [
        {
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: 1,
          },
          text: prefix,
          forceMoveMarkers: true,
        },
      ]);
    }

    editor.focus();
  }, []);

  const insertBlock = React.useCallback((blockContent: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    if (!selection) return;

    editor.executeEdits("markdown-editor", [
      {
        range: selection,
        text: `\n${blockContent}\n`,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  }, []);

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.toolbar} role="toolbar" aria-label="Markdown Editor Toolbar">
        <div className={styles["toolbar-group"]}>
          {/* Headings */}
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Heading 1"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("# ", "Heading 1")}
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Heading 2"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("## ", "Heading 2")}
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Heading 3"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("### ", "Heading 3")}
          >
            <Heading3 size={15} />
          </button>

          <span className={styles["toolbar-divider"]} />

          {/* Inline format */}
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
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Inline Math ($formula$)"
            disabled={disabled || viewMode === "preview"}
            onClick={() => applyFormatting("$", "$", "x^2 + y^2 = z^2")}
          >
            <Sigma size={15} />
          </button>

          <span className={styles["toolbar-divider"]} />

          {/* Blocks */}
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Code block"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertBlock("```typescript\n// code here\n```")}
          >
            <Code size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Bullet list"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("- ", "list item")}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Numbered list"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("1. ", "list item")}
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Quote"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertLinePrefix("> ", "Quote text")}
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Link"
            disabled={disabled || viewMode === "preview"}
            onClick={() => applyFormatting("[", "](https://example.com)", "link text")}
          >
            <Link size={15} />
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Table"
            disabled={disabled || viewMode === "preview"}
            onClick={() =>
              insertBlock(
                "| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |",
              )
            }
          >
            <Table size={15} />
          </button>

          <span className={styles["toolbar-divider"]} />

          {/* GitHub Alert Notes */}
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Insert Note Alert"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertBlock("> [!NOTE]\n> Note content here")}
          >
            <Info size={15} style={{ marginRight: "0.2rem" }} /> Note
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Insert Tip Alert"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertBlock("> [!TIP]\n> Tip content here")}
          >
            <Lightbulb size={15} style={{ marginRight: "0.2rem" }} /> Tip
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Insert Warning Alert"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertBlock("> [!WARNING]\n> Warning content here")}
          >
            <AlertTriangle size={15} style={{ marginRight: "0.2rem" }} /> Warn
          </button>
          <button
            type="button"
            className={styles["toolbar-btn"]}
            title="Insert Caution Alert"
            disabled={disabled || viewMode === "preview"}
            onClick={() => insertBlock("> [!CAUTION]\n> Caution content here")}
          >
            <ShieldAlert size={15} style={{ marginRight: "0.2rem" }} /> Caution
          </button>
        </div>

        {/* View mode toggle */}
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
            <Editor
              height={minHeight}
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

        {viewMode !== "write" && (
          <div className={clsx(styles.pane, styles["preview-pane"])} style={{ minHeight }}>
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
