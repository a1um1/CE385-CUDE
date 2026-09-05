import { Group, Panel, Separator } from "react-resizable-panels";
import { useEditorContext } from "./editorContext";
import styles from "../styles/ioPanel.module.css";
import formatNstoMs from "#/lib/formatNs";
import formatBytetoMb from "#/lib/formatByte";

export default function IOPanel() {
  const {
    stdin,
    setStdin,
    stdout,
    stderr,
    runCode,
    layout: { panelLayout, currentIoLayout, handleIoLayoutChange },
    runResult,
    disableOutput,
  } = useEditorContext();

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      runCode?.();
    }
  }
  const isSideBarHidden = !setStdin && disableOutput;

  if (isSideBarHidden) return undefined;

  return (
    <>
      <Separator className={styles.resizeHandle} />

      <Panel id="io" defaultSize="35%" minSize="15%" collapsible className={styles.sidebarPanel}>
        <Group
          key={`io-${panelLayout}`}
          id={`codeEditor-io-${panelLayout}`}
          orientation={panelLayout === "side" ? "vertical" : "horizontal"}
          defaultLayout={currentIoLayout.defaultLayout}
          onLayoutChanged={handleIoLayoutChange}
          className={styles.ioWrapper}
        >
          {setStdin && (
            <>
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
            </>
          )}
          {!disableOutput && (
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
                {runResult && (
                  <pre>
                    Exit with status {runResult.status} ({runResult.exitCode})<br />
                    Time usage: {formatNstoMs(runResult.time)} ms
                    <br />
                    Memory usage: {formatBytetoMb(runResult.memory)} Mb
                    <br />
                    Peak Process: {runResult.procPeak}
                  </pre>
                )}
              </div>
            </Panel>
          )}
        </Group>
      </Panel>
    </>
  );
}
