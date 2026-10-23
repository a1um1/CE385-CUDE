import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import Button from "#/components/button";
import Input from "#/components/input";
import formStyles from "#/components/form/form.module.css";
import { useAppForm } from "#/components/form";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import MarkdownEditor from "#/components/markdownEditor";
import { Editor } from "@monaco-editor/react";
import { Plus, Trash2 } from "lucide-react";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";

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
  testCases: FormTestCase[];
}

export interface ExerciseFormProps {
  defaultValues?: ExerciseFormValues;
  onSubmit: (values: ExerciseFormValues) => void | Promise<void>;
  submitLabel?: string;
  isPending?: boolean;
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

export function ExerciseForm({
  defaultValues = defaultValuesFallback,
  onSubmit,
  submitLabel = "Submit",
  isPending,
  isEdit = false,
}: ExerciseFormProps) {
  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
  });

  const lessonItems = React.useMemo(
    () =>
      (lessonsQuery.data?.items ?? []).map((l) => ({
        value: l.id,
        label: l.name,
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <form.FormError />
        <form.AppField name="name">
          {(field) => (
            <field.TextField label="Exercise Name" type="text" required disabled={isPending} />
          )}
        </form.AppField>

        <form.Field name="lessonID">
          {(field) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                marginTop: "0.75rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Lesson <span style={{ color: "red" }}>*</span>
                {isEdit && (
                  <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                    (Cannot be changed once created)
                  </span>
                )}
              </label>
              <SelectRoot
                value={field.state.value || null}
                onValueChange={(val) => field.handleChange(val ?? "")}
                disabled={isPending || isEdit || lessonsQuery.isLoading}
                items={lessonItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson..." />
                </SelectTrigger>
                <SelectContent>
                  {lessonsQuery.data?.items?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                marginTop: "0.75rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Exercise Type <span style={{ color: "red" }}>*</span>
                {isEdit && (
                  <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "0.5rem" }}>
                    (Cannot be changed once created)
                  </span>
                )}
              </label>
              <SelectRoot
                value={field.state.value}
                onValueChange={(val) => field.handleChange((val as "NONE" | "CODE") ?? "NONE")}
                disabled={isPending || isEdit}
                items={typeItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercise type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Reading Only (Markdown)</SelectItem>
                  <SelectItem value="CODE">Code Exercise (Programming)</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
          )}
        </form.Field>

        <form.Field name="content">
          {(field) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                marginTop: "0.75rem",
              }}
            >
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Exercise Content / Problem Statement (Markdown){" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <MarkdownEditor
                value={field.state.value}
                onChange={(val) => field.handleChange(val)}
                disabled={isPending}
                height={450}
              />
            </div>
          )}
        </form.Field>

        {exerciseType === "CODE" && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              border: "1px solid var(--color-border, #333)",
              borderRadius: "0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
              Code Configuration & Limits
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <form.Field name="language">
                {(field) => (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      Language <span style={{ color: "red" }}>*</span>
                    </label>
                    <SelectRoot
                      value={field.state.value}
                      onValueChange={(val) =>
                        field.handleChange((val as "python" | "c") ?? "python")
                      }
                      disabled={isPending}
                      items={languageItems}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python (3.11)</SelectItem>
                        <SelectItem value="c">C (C11)</SelectItem>
                      </SelectContent>
                    </SelectRoot>
                  </div>
                )}
              </form.Field>

              <form.Field name="timeLimitMs">
                {(field) => (
                  <div className={formStyles["form-field"]}>
                    <label htmlFor="timeLimitMs" className={formStyles.label}>
                      Time Limit (ms)
                    </label>
                    <Input
                      id="timeLimitMs"
                      type="number"
                      min={100}
                      max={10_000}
                      step={100}
                      required
                      disabled={isPending}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number.parseInt(e.target.value, 10) || 2000)
                      }
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="memoryLimitMb">
                {(field) => (
                  <div className={formStyles["form-field"]}>
                    <label htmlFor="memoryLimitMb" className={formStyles.label}>
                      Memory Limit (MB)
                    </label>
                    <Input
                      id="memoryLimitMb"
                      type="number"
                      min={16}
                      max={1024}
                      step={16}
                      required
                      disabled={isPending}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number.parseInt(e.target.value, 10) || 256)
                      }
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="starterCode">
              {(field) => (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    Starter Code (Initial code shown to students)
                  </label>
                  <div
                    style={{
                      height: 180,
                      border: "1px solid var(--color-border, #444)",
                      borderRadius: "0.25rem",
                      overflow: "hidden",
                    }}
                  >
                    <Editor
                      height="100%"
                      language={form.getFieldValue("language") === "c" ? "c" : "python"}
                      theme="vs-dark"
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val ?? "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isPending,
                      }}
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="testCases">
              {(field) => {
                const cases: FormTestCase[] = field.state.value || [];

                const addCase = () => {
                  field.handleChange([...cases, { input: "", output: "", isPublic: false }]);
                };

                const removeCase = (idx: number) => {
                  field.handleChange(cases.filter((_, i) => i !== idx));
                };

                const updateCase = (idx: number, patch: Partial<FormTestCase>) => {
                  field.handleChange(cases.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
                };

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <label style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        Test Cases ({cases.length})
                      </label>
                      <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        onClick={addCase}
                        disabled={isPending}
                      >
                        <Plus size={14} /> Add Test Case
                      </Button>
                    </div>

                    {cases.length === 0 ? (
                      <div
                        style={{
                          fontSize: "0.825rem",
                          color: "#888",
                          padding: "0.75rem",
                          border: "1px dashed var(--color-border, #444)",
                          borderRadius: "0.25rem",
                          textAlign: "center",
                        }}
                      >
                        No test cases added yet. Click &quot;Add Test Case&quot; to define input and
                        expected output.
                      </div>
                    ) : (
                      cases.map((tc, idx) => (
                        <div
                          key={tc.id ?? idx}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            padding: "0.75rem",
                            border: "1px solid var(--color-border, #333)",
                            borderRadius: "0.375rem",
                            backgroundColor: "rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                              Case #{idx + 1}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              <label
                                style={{
                                  fontSize: "0.75rem",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  cursor: "pointer",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={tc.isPublic}
                                  onChange={(e) => updateCase(idx, { isPublic: e.target.checked })}
                                  disabled={isPending}
                                />
                                Public (visible to students in problem statement)
                              </label>
                              <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                onClick={() => removeCase(idx)}
                                disabled={isPending}
                                style={{ color: "var(--color-danger, #ff5555)" }}
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "0.75rem",
                            }}
                          >
                            <div
                              style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
                            >
                              <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                                Standard Input
                              </span>
                              <textarea
                                rows={2}
                                value={tc.input}
                                onChange={(e) => updateCase(idx, { input: e.target.value })}
                                disabled={isPending}
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  padding: "0.4rem",
                                  borderRadius: "0.25rem",
                                  border: "1px solid var(--color-border, #444)",
                                  backgroundColor: "#111",
                                  color: "#eee",
                                  resize: "vertical",
                                }}
                                placeholder="stdin..."
                              />
                            </div>
                            <div
                              style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
                            >
                              <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                                Expected Output
                              </span>
                              <textarea
                                rows={2}
                                value={tc.output}
                                onChange={(e) => updateCase(idx, { output: e.target.value })}
                                disabled={isPending}
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  padding: "0.4rem",
                                  borderRadius: "0.25rem",
                                  border: "1px solid var(--color-border, #444)",
                                  backgroundColor: "#111",
                                  color: "#eee",
                                  resize: "vertical",
                                }}
                                placeholder="stdout..."
                              />
                            </div>
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

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1.25rem",
          }}
        >
          <form.SubmitButton label={submitLabel} isPending={isPending} />
          <ButtonLink
            to="/admin/exercise"
            search={{
              cursor: undefined,
              perPage: 20,
              direction: "forward",
            }}
            variant="secondary"
          >
            Cancel
          </ButtonLink>
        </div>
      </form.AppForm>
    </form>
  );
}

export default ExerciseForm;
