import GoJudgeClient from "#/controller/go-judge";

const goJudgeClient = new GoJudgeClient();

const result = await goJudgeClient.runCodeFromFiles({
  language: "python",
  files: {
    "temp.py": {
      content: `def add(a, b):
	return int(a) + int(b)`,
    },
    "main.py": {
      content: `from temp import add
print(add(input(), input()))`,
      isMainFile: true,
    },
  },
  input: "5\n3",
});
console.log(result);
