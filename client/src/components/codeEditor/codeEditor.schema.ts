import type { components } from "#/data/base/openapi";

export type CodeLanguage = keyof components["schemas"]["JudgeLanguagesResponse"]["languages"];

export type RunResult = components["schemas"]["JudgeCleanRunResult"];
export type TestResult = components["schemas"]["codeGraderResult"];
export type PanelLayout = "side" | "bottom";

export const LS_LAYOUT_KEY = "codeEditor_panelLayout";

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
  runResult?: RunResult;
  /** Test case results; replaces the raw stdout/stderr output when set. */
  testResults?: TestResult[];
  disableOutput?: boolean;
}
