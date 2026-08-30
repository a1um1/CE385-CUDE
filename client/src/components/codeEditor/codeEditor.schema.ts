import type { components } from "#/data/base/openapi";

export type CodeLanguage = keyof components["schemas"]["JudgeLanguagesResponse"]["languages"];

export const LANGUAGE_OPTIONS: { label: string; value: CodeLanguage }[] = [
  { label: "C", value: "c" },
  { label: "Python", value: "python" },
];

export const MONACO_LANGUAGE_MAP: Record<CodeLanguage, string> = {
  c: "c",
  python: "python",
};

export type PanelLayout = "side" | "bottom";

export const LS_LAYOUT_KEY = "codeEditor_panelLayout";
export const LS_SIZE_KEY = "codeEditor_panelSize";

export const DEFAULT_SIDE_SIZE = 300;
export const DEFAULT_BOTTOM_SIZE = 200;

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
