import Button from "#/components/button";
import CodeEditor, { type CodeLanguage } from "#/components/codeEditor";
import type { ExtractRequestBody } from "#/data/base/apiUtils.type";
import { APIclient } from "#/data/base/baseAPI";
import formatNstoMs from "#/lib/formatNs";
import formatFileSize from "#/lib/formatSize";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import styles from "./play-grader.module.css";

export const Route = createFileRoute("/(authed)/(base)/play-grader")({
  component: RouteComponent,
});

const defualtCode = `def two_sum(nums, target):
	# Your code here
	return []

test = input().strip().split(" ")
target = int(input().strip())
print(two_sum(test, target))`;

const defaultTestCases = [
  {
    input: "2 7 11 15\n9",
    output: "[0, 1]",
  },
  {
    input: "3 2 4\n6",
    output: "[1, 2]",
  },
  {
    input: "3 3\n6",
    output: "[0, 1]",
  },
];
const defaultLangauge = `python` as const;
function RouteComponent() {
  const [code, setCode] = useState<string>(defualtCode);
  const [language, setLanguage] = useState<CodeLanguage>(defaultLangauge);
  const [testCases, setTestCases] = useState<
    {
      input: string;
      output: string;
    }[]
  >(defaultTestCases);

  const runMuation = useMutation({
    mutationKey: ["run-grader"],
    mutationFn: async (body: ExtractRequestBody<"/coding/judge", "post">) => {
      const { data, error } = await APIclient.POST("/coding/judge", {
        body,
      });
      if (error) throw error;
      return data;
    },
  });

  const handleRunCode = () => {
    runMuation.mutate({
      code,
      language,
      testCases,
    });
  };

  const addTestCase = () => {
    setTestCases((base) => [
      ...base,
      {
        input: "",
        output: "",
      },
    ]);
  };

  const handleDeleteTestCase = (index: number) => {
    setTestCases((base) => base.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const index = Number.parseInt(e.target.getAttribute("data-index") || "-1", 10);
    const name = e.target.name as keyof (typeof testCases)[number];
    const val = e.target.value;
    setTestCases((base) =>
      base.map((data, i) => {
        if (i === index) data[name] = val;

        return data;
      }),
    );
  };

  return (
    <>
      <h1>Grader</h1>
      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onChangeLanguage={setLanguage}
            runCode={handleRunCode}
            disableOutput
          />
        </div>
        <div>
          <Button onClick={addTestCase}>Add Test case</Button>
          {testCases.map((data, index) => (
            // oxlint-disable-next-line react/no-array-index-key
            <div key={`test-case-${index}`} className={styles.testCaseRow}>
              <div className={styles.testCaseField}>
                <label>Input</label>
                <textarea
                  value={data.input}
                  data-index={index}
                  name="input"
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.testCaseField}>
                <label>Output</label>
                <textarea
                  value={data.output}
                  data-index={index}
                  name="output"
                  onChange={handleInputChange}
                />
              </div>
              <Button variant="secondary" onClick={() => handleDeleteTestCase(index)}>
                Delete
              </Button>
            </div>
          ))}
          <br />

          <div className={styles.resultsHeader}>
            <div>OK?</div>
            <div>Input</div>
            <div>Expected Output</div>
            <div>Output</div>
          </div>
          {(runMuation?.data?.testResults || [])?.map((v) => (
            <div
              key={`test-${v.input}-${v.expectedOutput}`}
              className={`${styles.resultRow} ${v.ok ? styles.resultRowSuccess : styles.resultRowFailure}`}
            >
              <div>{v.ok ? <CheckIcon /> : <XIcon />}</div>
              <div>{v.input}</div>
              <div>{v.expectedOutput}</div>
              <div>{v.output}</div>
            </div>
          ))}

          <div className={styles.statisticsContainer}>
            <div className={styles.percentageCircle}>
              {typeof runMuation.data?.percentage === "number"
                ? runMuation.data.percentage.toFixed(0)
                : "?"}
              <small className={styles.percentageSign}>%</small>
            </div>
            <div className={styles.statisticsDetails}>
              <p>Total Cases: {runMuation?.data?.total}</p>
              <p>Passed: {runMuation?.data?.passed}</p>
              <p>Failed: {runMuation?.data?.failed}</p>
              <p>Failed: {runMuation?.data?.failed}</p>
              <p>Average Time: {formatNstoMs(runMuation?.data?.averageTime || 0)} ms</p>
              <p>
                Average Memory: {formatFileSize(runMuation?.data?.averageMemory || 0, "Bytes")} Mb
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
