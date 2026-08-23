import { Editor } from "@monaco-editor/react";
import Spinner from "#/components/spinner";
import styles from "./codeEditor.module.css";
import Button from "#/components/button";
import { PanelBottomIcon, PanelRightIcon, PlayIcon } from "lucide-react";
import type { components } from "#/data/base/openapi";
import { useEffect, useRef, useState } from "react";

export type CodeLanguage = keyof components["schemas"]["JudgeLanguagesResponse"]["languages"];

const LANGUAGE_OPTIONS: { label: string; value: CodeLanguage }[] = [
  { label: "C", value: "c" },
  { label: "Python", value: "python" },
];

const MONACO_LANGUAGE_MAP: Record<CodeLanguage, string> = {
  c: "c",
  python: "python",
};

type PanelLayout = "side" | "bottom";

const LS_LAYOUT_KEY = "codeEditor_panelLayout";
const LS_SIZE_KEY = "codeEditor_panelSize";

const DEFAULT_SIDE_SIZE = 300;
const DEFAULT_BOTTOM_SIZE = 200;

function getInitialLayout(): PanelLayout {
  const stored = localStorage.getItem(LS_LAYOUT_KEY);
  return stored === "bottom" ? "bottom" : "side";
}

function getInitialSize(layout: PanelLayout): number {
  const stored = localStorage.getItem(LS_SIZE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return layout === "side" ? DEFAULT_SIDE_SIZE : DEFAULT_BOTTOM_SIZE;
}

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
  const [panelLayout, setPanelLayout] = useState<PanelLayout>(getInitialLayout);
  const [panelSize, setPanelSize] = useState<number>(() => getInitialSize(getInitialLayout()));

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    localStorage.setItem(LS_LAYOUT_KEY, panelLayout);
  }, [panelLayout]);

  useEffect(() => {
    localStorage.setItem(LS_SIZE_KEY, String(panelSize));
  }, [panelSize]);

  function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onChangeLanguage?.(event.target.value as CodeLanguage);
    onChange("");
  }

  function handleEditorChange(newValue: string | undefined) {
    onChange(newValue ?? "");
  }

  function toggleLayout() {
    setPanelLayout((prev) => {
      const next = prev === "side" ? "bottom" : "side";
      setPanelSize(next === "side" ? DEFAULT_SIDE_SIZE : DEFAULT_BOTTOM_SIZE);
      return next;
    });
  }

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;

    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
    document.body.style.cursor = panelLayout === "side" ? "col-resize" : "row-resize";

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (panelLayout === "side") {
        // Sidebar is on the right; new width = right edge - mouse X
        const newWidth = rect.right - ev.clientX;
        setPanelSize(Math.max(100, Math.min(newWidth, rect.width * 0.5)));
      } else {
        // Panel is on the bottom; new height = bottom edge - mouse Y
        const newHeight = rect.bottom - ev.clientY;
        setPanelSize(Math.max(100, Math.min(newHeight, rect.height * 0.5)));
      }
    }

    function onMouseUp() {
      isDragging.current = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  const panelStyle: React.CSSProperties =
    panelLayout === "side" ? { width: panelSize } : { height: panelSize };

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
        <div className={styles.toolbarActions}>
          <Button
            onClick={toggleLayout}
            size="xs"
            title={panelLayout === "side" ? "Switch to bottom panel" : "Switch to side panel"}
            style={{ height: "21px", width: "21", padding: 0, minWidth: "24px" }}
          >
            {panelLayout === "side" ? <PanelBottomIcon size={14} /> : <PanelRightIcon size={14} />}
          </Button>
          {runCode && (
            <Button onClick={runCode} size="xs">
              <PlayIcon fill="currentColor" />
              Run
            </Button>
          )}
        </div>
      </div>

      <div className={styles.editorWrapper} data-layout={panelLayout} ref={containerRef}>
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

        {/* Drag handle — sits between editor and panel */}
        <div
          className={styles.resizeHandle}
          data-layout={panelLayout}
          onMouseDown={handleResizeStart}
        />

        <div className={styles.editorSidebar} data-layout={panelLayout} style={panelStyle}>
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
