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
        $ run public tests — {passed}/{results.length} passed
      </div>
      {results.map((result, index) => (
        // oxlint-disable-next-line react/no-array-index-key
        <div key={index} className={clsx(styles.case, result.ok ? styles.pass : styles.fail)}>
          <div>
            <span className={styles.label}>{result.ok ? "PASS" : "FAIL"}</span>
            <span className={styles.meta}>
              {" "}
              test {index + 1} · {formatNstoMs(result.time)} ms ·{" "}
              {formatFileSize(result.memory, "Bytes")}
            </span>
          </div>
          <div className={styles.line}>
            in {"  "}
            {result.input || "(empty)"}
          </div>
          <div className={styles.line}>out {result.output || "(no output)"}</div>
          {!result.ok && <div className={styles.mismatch}>exp {result.expectedOutput}</div>}
          {result.error && <div className={styles.mismatch}>err {result.error.trim()}</div>}
        </div>
      ))}
    </div>
  );
}
