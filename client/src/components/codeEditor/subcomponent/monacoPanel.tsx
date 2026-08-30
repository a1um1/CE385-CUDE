import { Editor, type OnMount } from "@monaco-editor/react";
import { Panel } from "react-resizable-panels";
import { useEffect, useRef } from "react";
import Spinner from "#/components/spinner";
import { MONACO_LANGUAGE_MAP } from "../codeEditor.schema";
import { useEditorContext } from "./editorContext";
import styles from "../styles/monacoPanel.module.css";

export default function MonacoPanel() {
  const { value, onChange, language, runCode } = useEditorContext();
  const runCodeRef = useRef(runCode);

  useEffect(() => {
    runCodeRef.current = runCode;
  }, [runCode]);

  function handleEditorChange(newValue: string | undefined) {
    onChange(newValue ?? "");
  }

  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      runCodeRef.current?.();
    });
  };

  return (
    <Panel id="editor" defaultSize="65%" minSize="25%" className={styles.editorPanel}>
      <div className={styles.editorContainer}>
        <Editor
          language={MONACO_LANGUAGE_MAP[language ?? "c"]}
          value={value}
          theme="vs-dark"
          height="100%"
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          loading={<Spinner />}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            tabSize: 4,
            automaticLayout: true,
          }}
        />
      </div>
    </Panel>
  );
}
