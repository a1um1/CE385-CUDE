import Grader from "../grader";

const grader = new Grader();

const reuslt = await grader.grade(
  `def add(a, b):
	return int(a) + int(b)\n
print(add(input(), input()))`,
  "python",
  [
    { input: "5\n3", output: "8" },
    { input: "1\n1", output: "2" },
    { input: "2\n2", output: "4" },
    { input: "-1\n -1", output: "-2" },
    { input: "\n\n", output: "-2" },
  ],
);

console.log(reuslt);
