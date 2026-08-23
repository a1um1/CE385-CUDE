import { Editor } from "@monaco-editor/react";
import Spinner from "#/components/spinner";
import styles from "./codeEditor.module.css";
import Button from "#/components/button";
import { PlayIcon } from "lucide-react";
import type { components } from "#/data/base/openapi";

export type CodeLanguage = keyof components["schemas"]["JudgeLanguagesResponse"]["languages"];

const LANGUAGE_OPTIONS: { label: string; value: CodeLanguage }[] = [
  { label: "C", value: "c" },
  { label: "Python", value: "python" },
];

const MONACO_LANGUAGE_MAP: Record<CodeLanguage, string> = {
  c: "c",
  python: "python",
};

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  onChangeLanguage?: (value: CodeLanguage) => void;
  disableLanguageSwitch?: boolean;
  runCode?: () => void;
  stdin?: string;
  setStdin?: (value: string) => void;
  stderr?: string;
  stdout?: string;
  className?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  onChangeLanguage,
  className,
  disableLanguageSwitch,
  runCode,
  setStdin,
  stderr,
  stdout,
  stdin,
}: CodeEditorProps) {
  function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onChangeLanguage?.(event.target.value as CodeLanguage);
    onChange("");
  }

  function handleEditorChange(newValue: string | undefined) {
    onChange(newValue ?? "");
  }

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <div className={styles.toolbar}>
        <select
          className={styles.languageSelect}
          value={language}
          onChange={handleLanguageChange}
          aria-label="Programming language"
          disabled={disableLanguageSwitch}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {runCode && (
          <Button onClick={runCode} size="xs">
            <PlayIcon fill="currentColor" />
            Run
          </Button>
        )}
      </div>

      <div className={styles.editorWrapper}>
        <div className={styles.editorContainer}>
          <Editor
            language={MONACO_LANGUAGE_MAP[language ?? "c"]}
            value={value}
            theme="vs-dark"
            height="100%"
            onChange={handleEditorChange}
            loading={<Spinner />}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: '"Space Mono", monospace',
              scrollBeyondLastLine: false,
              tabSize: 4,
            }}
          />
        </div>
        <div className={styles.editorSidebar}>
          <div className={styles.editorStdin}>
            <label className={styles.editorLabel}>Input</label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin?.(e.target.value)}
              placeholder="Enter input..."
            />
          </div>
          <div className={styles.editorStdout}>
            <label className={styles.editorLabel}>Output</label>
            <pre>
              {stderr} {stdout}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
