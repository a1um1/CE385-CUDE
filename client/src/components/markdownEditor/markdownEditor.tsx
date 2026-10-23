import * as React from "react";
import clsx from "clsx";
import { Editor, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import Markdown from "#/components/markdown";
import Spinner from "#/components/spinner";
import styles from "./markdownEditor.module.css";
import {
  type AlertType,
  type HeadingType,
  detectAlert,
  detectHeading,
  detectInlineFormat,
  executeAlert,
  executeHeading,
  executeInsertBlock,
  executeLinePrefix,
  executeWrap,
} from "./editorActions";
import { EditorToolbar } from "./editorToolbar";
import { MarkdownEditorContext } from "./editorContext";

export type { HeadingType, AlertType } from "./editorActions";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  defaultShowEditor?: boolean;
  defaultShowPreview?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  disabled = false,
  height,
  minHeight = 450,
  maxHeight,
  width,
  maxWidth,
  defaultShowEditor = true,
  defaultShowPreview = true,
  className,
  style,
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
    if (onBlur) editor.onDidBlurEditorWidget(onBlur);
    editor.onDidChangeCursorPosition(updateActiveStates);
    editor.onDidChangeCursorSelection(updateActiveStates);
  };

  const handleAction = React.useCallback(
    (fn: (editor: Monaco.editor.IStandaloneCodeEditor) => void) => {
      const editor = editorRef.current;
      if (!editor) return;
      fn(editor);
      editor.focus();
      updateActiveStates();
    },
    [updateActiveStates],
  );

  const contextValue = React.useMemo(
    () => ({
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
      editorRef,
      setHeading: (type: HeadingType) =>
        handleAction((ed) => executeHeading(ed, type, currentHeading)),
      setAlert: (type: AlertType) => handleAction((ed) => executeAlert(ed, type, currentAlert)),
      toggleInline: (wrap: string, defaultText = "text") =>
        handleAction((ed) => executeWrap(ed, wrap, defaultText)),
      toggleLinePrefix: (prefix: string, isActive: boolean) =>
        handleAction((ed) => executeLinePrefix(ed, prefix, isActive)),
      insertBlock: (block: string) => handleAction((ed) => executeInsertBlock(ed, block)),
      toggleEditorWindow: () => setShowEditor((prev) => (prev && !showPreview ? prev : !prev)),
      togglePreviewWindow: () => setShowPreview((prev) => (prev && !showEditor ? prev : !prev)),
    }),
    [
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
      handleAction,
    ],
  );

  return (
    <MarkdownEditorContext.Provider value={contextValue}>
      <div
        className={clsx(styles.container, className)}
        style={{
          position: "relative",
          height,
          minHeight,
          maxHeight,
          width,
          maxWidth,
          ...style,
        }}
      >
        <EditorToolbar />

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
    </MarkdownEditorContext.Provider>
  );
}

export default MarkdownEditor;
