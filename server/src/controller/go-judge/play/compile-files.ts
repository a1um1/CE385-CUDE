import GoJudgeClient from "#/controller/go-judge";

const goJudgeClient = new GoJudgeClient();

const { files, error } = await goJudgeClient.compileCodeFromFiles({
  files: {
    "mymath.h": {
      content: `#ifndef MYMATH_H
#define MYMATH_H

int add(int a, int b);

#endif`,
    },
    "temp.c": {
      content: '#include "mymath.h"\nint add(int a, int b) { return a + b; }',
      includeInArgs: true,
    },
    "main.c": {
      content: `#include <stdio.h>
#include "mymath.h"

int main() {
		int a, b;
		scanf("%d %d", &a, &b);
		printf("%d\\n", add(a, b));
		return 0;
}`,
      includeInArgs: true,
    },
  },
  language: "c",
});

if (error) {
  console.error("Compilation failed:", error);
  process.exit(1);
}
if (!files) {
  console.error("Compilation failed but no files returned");
  process.exit(1);
}

const result = await goJudgeClient.runCodeFromFiles({
  files,
  language: "c",
  input: "5\n3",
});
console.log(result);
