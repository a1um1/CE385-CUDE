import CodeEditor, { type CodeLanguage } from "#/components/codeEditor";
import { APIclient, type ExtractRequestBody } from "#/data/base/baseAPI";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(base)/play")({
  component: RouteComponent,
});

function RouteComponent() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [stdin, setStdin] = useState<string>("");

  const runMuation = useMutation({
    mutationKey: ["run-code"],
    mutationFn: async (body: ExtractRequestBody<"/coding/run", "post">) => {
      const { data, error } = await APIclient.POST("/coding/run", {
        body,
      });
      if (error || !data) throw error;
      return data;
    },
  });

  const handleRunCode = () => {
    runMuation.mutate({
      code,
      language,
      input: stdin,
    });
  };

  return (
    <>
      <h1>Playground</h1>
      <div className="h-[calc(100vh-10rem)]">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          onChangeLanguage={setLanguage}
          runCode={handleRunCode}
          stdin={stdin}
          setStdin={setStdin}

          stdout={runMuation.data?.stdout}
          stderr={runMuation.data?.stderr}
          runResult={runMuation.data}
        />
      </div>
    </>
  );
}
