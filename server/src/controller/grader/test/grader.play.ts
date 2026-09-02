import CodeGrader from "../codeGrader";

const grader = new CodeGrader();

const reuslt = await grader.grade({
  code: `def add(a, b):
	return int(a) + int(b)\n
print(add(input(), input()))`,
  language: "python",
  testCases: [
    { input: "5\n3", output: "8" },
    { input: "1\n1", output: "2" },
    { input: "2\n2", output: "4" },
    { input: "-1\n -1", output: "-2" },
    { input: "0\n0", output: "1" },
  ],
});

console.log(reuslt);
const summary = grader.gradeSummary(reuslt);
console.log(summary);
