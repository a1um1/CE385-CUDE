import * as React from "react";
import Button from "#/components/button";
import styles from "./exerciseForm.module.css";
import { useAppForm, useFormPending } from "#/components/form";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import { Editor } from "@monaco-editor/react";
import {
  Plus,
  Trash2,
  FileText,
  Code2,
  Code,
  Database,
  Play,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import { APIclient } from "#/data/base/baseAPI";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import formatNstoMs from "#/lib/formatNs";

export interface FormTestCase {
  id?: string;
  input: string;
  output: string;
  isPublic: boolean;
}

export interface ExerciseFormValues {
  name: string;
  lessonID: string;
  type: "NONE" | "CODE";
  content: string;
  language: "python" | "c";
  timeLimitMs: number;
  memoryLimitMb: number;
  starterCode: string;
  testerCode: string;
  testCases: FormTestCase[];
}

export interface ExerciseFormProps {
  defaultValues?: ExerciseFormValues;
  onSubmit: (values: ExerciseFormValues) => void | Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

const defaultValuesFallback: ExerciseFormValues = {
  name: "",
  lessonID: "",
  type: "NONE",
  content: "",
  language: "python",
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  starterCode: "",
  testerCode: "",
  testCases: [],
};

const typeItems = [
  { value: "NONE", label: "Reading Only (Markdown)" },
  { value: "CODE", label: "Code Exercise (Programming)" },
];

const languageItems = [
  { value: "python", label: "Python (3.11)" },
  { value: "c", label: "C (C11)" },
];

type TabKey = "metadata" | "content" | "code" | "testcases";

export function ExerciseForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Save Changes",
  isEdit = false,
}: ExerciseFormProps) {
  const pending = useFormPending();
  const [activeTab, setActiveTab] = React.useState<TabKey>("metadata");
  const [solutionCode, setSolutionCode] = React.useState<string>(defaultValues.starterCode || "");

  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
  });

  const lessonItems = React.useMemo(
    () =>
      (lessonsQuery.data?.items ?? []).map((lesson) => ({
        value: lesson.id,
        label: lesson.name,
      })),
    [lessonsQuery.data?.items],
  );

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const exerciseType = form.getFieldValue("type");
  const testCasesCount = form.getFieldValue("testCases")?.length ?? 0;

  const judgeMutation = useMutation({
    mutationKey: ["admin-judge-testcases"],
    mutationFn: async (payload: {
      code: string;
      language: "python" | "c";
      testCases: { input: string; output: string }[];
    }) => {
      const { data, error } = await APIclient.POST("/coding/judge", {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to run test cases");
    },
  });

  const handleRunTestCases = () => {
    const code = solutionCode.trim() ? solutionCode : form.getFieldValue("starterCode") || "";
    const language = form.getFieldValue("language") || "python";
    const testCases = (form.getFieldValue("testCases") || []).map((testCase: FormTestCase) => ({
      input: testCase.input,
      output: testCase.output,
    }));

    if (!code.trim()) {
      toast.error("Please enter code in the Solution / Test Editor before running.");
      return;
    }
    if (testCases.length === 0) {
      toast.error("No test cases defined yet. Click 'Add Case' to add one.");
      return;
    }

    judgeMutation.mutate({ code, language, testCases });
  };

  return (
    <form
      className={styles["form-wrapper"]}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        {/* TOP TAB BAR with Integrated Title */}
        <div className={styles["top-bar"]}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className={styles["header-title"]}>
              {isEdit ? "Edit Exercise" : "Create Exercise"}
            </span>
            <div className={styles["tab-nav"]}>
              <button
                type="button"
                className={clsx(styles["tab-btn"], activeTab === "metadata" && styles.active)}
                onClick={() => setActiveTab("metadata")}
              >
                <FileText size={15} />
                <span>Metadata</span>
              </button>
              <button
                type="button"
                className={clsx(styles["tab-btn"], activeTab === "content" && styles.active)}
                onClick={() => setActiveTab("content")}
              >
                <Code2 size={15} />
                <span>Content</span>
              </button>
              {exerciseType === "CODE" && (
                <>
                  <button
                    type="button"
                    className={clsx(styles["tab-btn"], activeTab === "code" && styles.active)}
                    onClick={() => setActiveTab("code")}
                  >
                    <Code size={15} />
                    <span>Code Config</span>
                  </button>
                  <button
                    type="button"
                    className={clsx(styles["tab-btn"], activeTab === "testcases" && styles.active)}
                    onClick={() => setActiveTab("testcases")}
                  >
                    <Database size={15} />
                    <span>Test Cases</span>
                    <span className={styles["tab-badge"]}>{testCasesCount}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles["main-body"]}>
          <form.FormError />

          {/* TAB 1: METADATA */}
          <div
            className={styles["tab-content"]}
            style={{ display: activeTab === "metadata" ? "flex" : "none", maxWidth: 760 }}
          >
            <form.AppField name="name">
              {(field) => <field.TextField label="Exercise Name" type="text" required />}
            </form.AppField>

            <form.AppField name="lessonID">
              {(field) => (
                <field.SelectField
                  label="Lesson"
                  required
                  placeholder="Select a lesson..."
                  items={lessonItems}
                  disabled={isEdit || lessonsQuery.isLoading}
                />
              )}
            </form.AppField>

            <form.AppField name="type">
              {(field) => (
                <field.SelectField
                  label="Exercise Type"
                  required
                  placeholder="Select exercise type..."
                  items={typeItems}
                  disabled={isEdit}
                  onValueChange={(value) => {
                    if (value === "NONE" && (activeTab === "code" || activeTab === "testcases")) {
                      setActiveTab("metadata");
                    }
                  }}
                />
              )}
            </form.AppField>
          </div>

          {/* TAB 2: CONTENT */}
          <div
            className={styles["tab-content"]}
            style={{ display: activeTab === "content" ? "flex" : "none" }}
          >
            <form.AppField name="content">
              {(field) => (
                <field.MarkdownField
                  label="Exercise Content / Problem Statement (Markdown)"
                  required
                  height="calc(100vh - 250px)"
                  minHeight={450}
                />
              )}
            </form.AppField>
          </div>

          {/* TAB 3: CODE CONFIG (Starter Code & Limits) */}
          {exerciseType === "CODE" && (
            <div
              className={styles["tab-content"]}
              style={{ display: activeTab === "code" ? "flex" : "none" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  maxWidth: 800,
                }}
              >
                <form.AppField name="language">
                  {(field) => (
                    <field.SelectField
                      label="Language"
                      required
                      placeholder="Language"
                      items={languageItems}
                    />
                  )}
                </form.AppField>

                <form.AppField name="timeLimitMs">
                  {(field) => (
                    <field.NumberField
                      label="Time Limit (ms)"
                      min={100}
                      max={10_000}
                      step={100}
                      required
                      fallback={2000}
                      parseAs="int"
                    />
                  )}
                </form.AppField>

                <form.AppField name="memoryLimitMb">
                  {(field) => (
                    <field.NumberField
                      label="Memory Limit (MB)"
                      min={16}
                      max={1024}
                      step={16}
                      required
                      fallback={256}
                      parseAs="int"
                    />
                  )}
                </form.AppField>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                  width: "100%",
                }}
              >
                <form.AppField name="starterCode">
                  {(field) => (
                    <field.CodeField
                      label="Starter Code (Shown to students)"
                      language={form.getFieldValue("language") === "c" ? "c" : "python"}
                    />
                  )}
                </form.AppField>

                <form.AppField name="testerCode">
                  {(field) => (
                    <field.CodeField
                      label="Tester Code (Optional test wrapper / driver)"
                      language={form.getFieldValue("language") === "c" ? "c" : "python"}
                    />
                  )}
                </form.AppField>
              </div>
            </div>
          )}

          {/* TAB 4: TEST CASES (Compact & Focused) */}
          {exerciseType === "CODE" && (
            <div
              className={styles["tab-content"]}
              style={{ display: activeTab === "testcases" ? "flex" : "none" }}
            >
              {/* Solution Code Editor for testing */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Solution Code to Test Against
                  </label>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      const starter = form.getFieldValue("starterCode") || "";
                      setSolutionCode(starter);
                      toast.info("Loaded starter code into solution editor");
                    }}
                  >
                    Copy from Starter Code
                  </Button>
                </div>
                <div
                  style={{
                    height: 200,
                    border: "1px solid var(--color-border, #444)",
                    borderRadius: "0.25rem",
                    overflow: "hidden",
                  }}
                >
                  <Editor
                    height="100%"
                    language={form.getFieldValue("language") === "c" ? "c" : "python"}
                    theme="vs-dark"
                    value={solutionCode}
                    onChange={(value) => setSolutionCode(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              <form.Field name="testCases">
                {(field) => {
                  const cases: FormTestCase[] = field.state.value || [];

                  const addCase = () => {
                    field.handleChange([...cases, { input: "", output: "", isPublic: false }]);
                  };

                  const removeCase = (index: number) => {
                    field.handleChange(cases.filter((_, i) => i !== index));
                  };

                  const updateCase = (index: number, patch: Partial<FormTestCase>) => {
                    field.handleChange(
                      cases.map((testCase, i) =>
                        i === index ? { ...testCase, ...patch } : testCase,
                      ),
                    );
                  };

                  return (
                    <div className={styles["tc-list"]}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                          Test Cases ({cases.length})
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            onClick={handleRunTestCases}
                            disabled={pending || cases.length === 0}
                          >
                            <Play size={14} />{" "}
                            {judgeMutation.isPending ? "Running..." : "Run Test Cases"}
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            onClick={addCase}
                            disabled={pending}
                          >
                            <Plus size={14} /> Add Case
                          </Button>
                        </div>
                      </div>

                      {judgeMutation.data && (
                        <div className={styles["judge-results"]}>
                          <div className={styles["judge-header"]}>
                            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                              Run Summary: {judgeMutation.data.passed}/{judgeMutation.data.total}{" "}
                              passed ({judgeMutation.data.percentage?.toFixed(0)}%)
                            </span>
                            <span
                              className={
                                judgeMutation.data.passed === judgeMutation.data.total
                                  ? styles["judge-badge-pass"]
                                  : styles["judge-badge-fail"]
                              }
                            >
                              Avg Time: {formatNstoMs(judgeMutation.data.averageTime || 0)} ms
                            </span>
                          </div>

                          <table className={styles["judge-table"]}>
                            <thead>
                              <tr>
                                <th style={{ width: 60 }}>Status</th>
                                <th>Input</th>
                                <th>Expected</th>
                                <th>Actual Output</th>
                              </tr>
                            </thead>
                            <tbody>
                              {judgeMutation.data.testResults.map((result) => (
                                <tr
                                  key={`${result.input}-${result.expectedOutput}-${result.output}`}
                                >
                                  <td>
                                    {result.ok ? (
                                      <span
                                        style={{
                                          color: "#4ade80",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.2rem",
                                        }}
                                      >
                                        <CheckCircle2 size={15} /> Pass
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          color: "#f87171",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "0.2rem",
                                        }}
                                      >
                                        <XCircle size={15} /> Fail
                                      </span>
                                    )}
                                  </td>
                                  <td>{result.input || "<empty>"}</td>
                                  <td>{result.expectedOutput || "<empty>"}</td>
                                  <td>{result.output || "<empty>"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {cases.length === 0 ? (
                        <div
                          style={{
                            fontSize: "0.825rem",
                            color: "#888",
                            padding: "1.5rem",
                            border: "1px dashed var(--color-border, #444)",
                            borderRadius: "0.25rem",
                            textAlign: "center",
                          }}
                        >
                          No test cases added yet. Click &quot;Add Case&quot; to define input and
                          expected output.
                        </div>
                      ) : (
                        cases.map((testCase, index) => (
                          <div key={testCase.id ?? index} className={styles["tc-card"]}>
                            <div className={styles["tc-card-header"]}>
                              <span className={styles["tc-card-title"]}>Case #{index + 1}</span>
                              <div className={styles["tc-card-actions"]}>
                                <label className={styles["tc-public-label"]}>
                                  <input
                                    type="checkbox"
                                    checked={testCase.isPublic}
                                    onChange={(e) =>
                                      updateCase(index, { isPublic: e.target.checked })
                                    }
                                    disabled={pending}
                                  />
                                  <span>Public</span>
                                </label>
                                <Button
                                  type="button"
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => removeCase(index)}
                                  disabled={pending}
                                  style={{
                                    color: "var(--color-danger, #ff5555)",
                                    padding: "0.2rem",
                                  }}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </div>

                            <div className={styles["tc-io-grid"]}>
                              <textarea
                                rows={2}
                                value={testCase.input}
                                onChange={(e) => updateCase(index, { input: e.target.value })}
                                disabled={pending}
                                className={styles["tc-textarea"]}
                                placeholder="stdin..."
                              />
                              <textarea
                                rows={2}
                                value={testCase.output}
                                onChange={(e) => updateCase(index, { output: e.target.value })}
                                disabled={pending}
                                className={styles["tc-textarea"]}
                                placeholder="stdout..."
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                }}
              </form.Field>
            </div>
          )}
        </div>

        {/* STICKY BOTTOM BAR (Cancel on left, Save Changes on right) */}
        <div className={styles["bottom-bar"]}>
          <form.CancelButton fallbackUrl="/admin/exercise" />

          <form.SubmitButton label={submitLabel} />
        </div>
      </form.AppForm>
    </form>
  );
}

export default ExerciseForm;
