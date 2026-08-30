import { createContext, useContext } from "react";
import type { CodeLanguage } from "../codeEditor.schema";
import type { useEditorLayout } from "../hooks/useEditorLayout";

export interface EditorContextValue {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  onChangeLanguage?: (language: CodeLanguage) => void;
  disableLanguageSwitch?: boolean;
  runCode?: () => void;
  stdin?: string;
  setStdin?: (value: string) => void;
  stdout?: string;
  stderr?: string;
  layout: ReturnType<typeof useEditorLayout>;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorContextProvider");
  }
  return context;
};

export const EditorContextProvider = EditorContext.Provider;
