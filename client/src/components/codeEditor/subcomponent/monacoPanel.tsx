import { Editor, type OnMount } from "@monaco-editor/react";
import { Panel } from "react-resizable-panels";
import { useEffect, useRef, type ReactNode } from "react";
import Spinner from "#/components/spinner";
import { useEditorContext } from "./editorContext";
import styles from "../styles/monacoPanel.module.css";
import { useCodeAvailableLanguage } from "#/data/code.data";

const CodeEditorPanelLayout = ({ children }: { children: ReactNode }) => (
  <Panel id="editor" defaultSize="65%" minSize="25%" className={styles.editorPanel}>
    {children}
  </Panel>
);

export default function MonacoPanel() {
  const { isLoading, isError } = useCodeAvailableLanguage();
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

  if (isLoading) return <CodeEditorPanelLayout>Loading</CodeEditorPanelLayout>;
  if (isError) return <CodeEditorPanelLayout>Error !</CodeEditorPanelLayout>;

  return (
    <CodeEditorPanelLayout>
      <div className={styles.editorContainer}>
        <Editor
          language={language}
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
    </CodeEditorPanelLayout>
  );
}
