import GoJudgeClient from "#/controller/go-judge";

const goJudgeClient = new GoJudgeClient();

const result = await goJudgeClient.runCode({
  code: `def add(a, b):
	return int(a) + int(b)
print(add(input(), input()))`,
  language: "python",
  input: "5\n3",
});

const resultC = await goJudgeClient.runCode({
  code: `#include <stdio.h>
int add(int a, int b) {
		return a + b;
}

int main() {
	int a, b;
	scanf("%d %d", &a, &b);
	printf("%d", add(a, b));
	return 0;
}
`,
  language: "c",
  input: "12\n12",
});

console.log(result);
console.log(resultC);
