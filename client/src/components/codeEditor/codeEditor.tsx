import clsx from "clsx";
import { Group, Separator } from "react-resizable-panels";
import styles from "./codeEditor.module.css";
import type { CodeEditorProps } from "./codeEditor.schema";
import { useEditorLayout } from "./hooks/useEditorLayout";
import { EditorContextProvider } from "./subcomponent/editorContext";
import EditorToolbar from "./subcomponent/toolbar";
import MonacoPanel from "./subcomponent/monacoPanel";
import IOPanel from "./subcomponent/ioPanel";

export type { CodeEditorProps, CodeLanguage, PanelLayout } from "./codeEditor.schema";

export default function CodeEditor(props: CodeEditorProps) {
  const { className } = props;
  const layout = useEditorLayout();
  const { panelLayout, currentMainLayout, handleMainLayoutChange } = layout;

  return (
    <EditorContextProvider value={{ ...props, layout }}>
      <div className={clsx(styles.container, className ?? "")}>
        <EditorToolbar />

        <Group
          key={`main-${panelLayout}`}
          id={`codeEditor-main-${panelLayout}`}
          orientation={panelLayout === "side" ? "horizontal" : "vertical"}
          defaultLayout={currentMainLayout.defaultLayout}
          onLayoutChanged={handleMainLayoutChange}
          className={styles.editorWrapper}
        >
          <MonacoPanel />
          <Separator className={styles.resizeHandle} />
          <IOPanel />
        </Group>
      </div>
    </EditorContextProvider>
  );
}
