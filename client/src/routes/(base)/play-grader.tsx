import Button from "#/components/button";
import CodeEditor, { type CodeLanguage } from "#/components/codeEditor";
import { APIclient, type ExtractRequestBody } from "#/data/base/baseAPI";
import formatBytetoMb from "#/lib/formatByte";
import formatNstoMs from "#/lib/formatNs";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(base)/play-grader")({
  component: RouteComponent,
});

const defualtCode = `print("Hello World")`;
const defaultLangauge = `python` as const;
function RouteComponent() {
  const [code, setCode] = useState<string>(defualtCode);
  const [language, setLanguage] = useState<CodeLanguage>(defaultLangauge);
  const [testCases, setTestCases] = useState<
    {
      input: string;
      output: string;
    }[]
  >([
    {
      input: "",
      output: "Hello World",
    },
  ]);

  const runMuation = useMutation({
    mutationKey: ["run-grader"],
    mutationFn: async (body: ExtractRequestBody<"/coding/judge", "post">) => {
      const { data, error } = await APIclient.POST("/coding/judge", {
        body,
      });
      if (error) throw error;
      if (!data) throw new Error("Failed to retrive data");
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
    const index = parseInt(e.target.getAttribute("data-index") || "-1");
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
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[calc(100vh-10rem)]">
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
            <div key={`test-case-${index}`} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label>Input</label>
                <textarea
                  value={data.input}
                  data-index={index}
                  name="input"
                  onChange={handleInputChange}
                />
              </div>
              <div>
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

          <div className="grid grid-cols-4">
            <div>OK?</div>
            <div>Input</div>
            <div>Expected Output</div>
            <div>Output</div>
          </div>
          {(runMuation?.data?.testResults || [])?.map((v) => (
            <div
              key={`test-${v.input}-${v.expectedOutput}`}
              className={clsx("grid grid-cols-4", v.ok ? "bg-green-500/20" : "bg-red-500/20")}
            >
              <div>{v.ok ? <CheckIcon /> : <XIcon />}</div>
              <div>{v.input}</div>
              <div>{v.expectedOutput}</div>
              <div>{v.output}</div>
            </div>
          ))}

          <div className="flex gap-4 items-start">
            <div className="aspect-squre bg-teal-500 w-48 h-48 flex items-center justify-center p-5 text-5xl">
              {runMuation.data?.percentage ?? "?"}
              <small className="text-lg">%</small>
            </div>
            <div>
              <p>Total Cases: {runMuation?.data?.total}</p>
              <p>Passed: {runMuation?.data?.passed}</p>
              <p>Failed: {runMuation?.data?.failed}</p>
              <p>Failed: {runMuation?.data?.failed}</p>
              <p>Average Time: {formatNstoMs(runMuation?.data?.averageTime || 0)} ms</p>
              <p>Average Memory: {formatBytetoMb(runMuation?.data?.averageMemory || 0)} mb</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
