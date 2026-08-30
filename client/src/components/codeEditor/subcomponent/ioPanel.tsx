import { Group, Panel, Separator } from "react-resizable-panels";
import { useEditorContext } from "./editorContext";
import styles from "../styles/ioPanel.module.css";

export default function IOPanel() {
  const {
    stdin,
    setStdin,
    stdout,
    stderr,
    runCode,
    layout: { panelLayout, currentIoLayout, handleIoLayoutChange },
  } = useEditorContext();

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      runCode?.();
    }
  }

  return (
    <Panel id="io" defaultSize="35%" minSize="15%" collapsible className={styles.sidebarPanel}>
      <Group
        key={`io-${panelLayout}`}
        id={`codeEditor-io-${panelLayout}`}
        orientation={panelLayout === "side" ? "vertical" : "horizontal"}
        defaultLayout={currentIoLayout.defaultLayout}
        onLayoutChanged={handleIoLayoutChange}
        className={styles.ioWrapper}
      >
        <Panel
          id="stdin"
          defaultSize="50%"
          minSize="15%"
          collapsible
          className={styles.editorStdin}
        >
          <label className={styles.editorLabel}>Input</label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter input..."
          />
        </Panel>

        <Separator className={styles.resizeHandle} />

        <Panel
          id="stdout"
          defaultSize="50%"
          minSize="15%"
          collapsible
          className={styles.editorStdout}
        >
          <label className={styles.editorLabel}>Output</label>
          <div>
            <pre className={styles.stderr}>{stderr}</pre>
            <pre>{stdout}</pre>
          </div>
        </Panel>
      </Group>
    </Panel>
  );
}
