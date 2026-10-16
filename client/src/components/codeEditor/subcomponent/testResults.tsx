import type { TestResult } from "#/components/codeEditor/codeEditor.schema";
import formatNstoMs from "#/lib/formatNs";
import formatFileSize from "#/lib/formatSize";
import clsx from "clsx";
import styles from "../styles/testResults.module.css";

export default function TestResults({ results }: { results: TestResult[] }) {
  const passed = results.filter((result) => result.ok).length;

  return (
    <div className={styles.results}>
      <div className={styles.summary}>
        $ Test Results: {passed}/{results.length} passed
      </div>
      {results.map((result, index) => (
        // oxlint-disable-next-line react/no-array-index-key
        <div key={index} className={clsx(styles.case, result.ok ? styles.pass : styles.fail)}>
          <div>
            <span>#{index + 1}</span>{" "}
            <span className={styles.label}>{result.ok ? "OK" : "KO"}</span>
            <span className={styles.meta}>
              {" "}
              {formatNstoMs(result.time)} ms | {formatFileSize(result.memory, "Bytes")}
            </span>
          </div>
          <div className={styles.line}>
            {"> "}
            {result.input || "(empty)"}
          </div>
          <div className={styles.line}>
            {"< "}
            {result.output || "(no output)"}
          </div>
          {!result.ok && <div className={styles.mismatch}>exp {result.expectedOutput}</div>}
          {result.error && <div className={styles.mismatch}>err {result.error.trim()}</div>}
        </div>
      ))}
    </div>
  );
}
