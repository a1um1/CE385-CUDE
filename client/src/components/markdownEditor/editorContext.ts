import { createContext, useContext } from "react";
import type * as Monaco from "monaco-editor";
import type { AlertType, HeadingType } from "./editorActions";

export interface MarkdownEditorContextValue {
  disabled: boolean;
  showEditor: boolean;
  showPreview: boolean;
  currentHeading: HeadingType;
  currentAlert: AlertType;
  isBold: boolean;
  isItalic: boolean;
  isMath: boolean;
  isCode: boolean;
  isList: boolean;
  isNumList: boolean;
  isQuote: boolean;
  editorRef: React.RefObject<Monaco.editor.IStandaloneCodeEditor | null>;
  setHeading: (type: HeadingType) => void;
  setAlert: (type: AlertType) => void;
  toggleInline: (wrap: string, defaultText?: string) => void;
  toggleLinePrefix: (prefix: string, isActive: boolean) => void;
  insertBlock: (block: string) => void;
  toggleEditorWindow: () => void;
  togglePreviewWindow: () => void;
}

export const MarkdownEditorContext = createContext<MarkdownEditorContextValue | null>(null);

export const useMarkdownEditor = () => {
  const context = useContext(MarkdownEditorContext);
  if (!context) {
    throw new Error("useMarkdownEditor must be used within MarkdownEditorContext.Provider");
  }
  return context;
};
