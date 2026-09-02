interface TestProps {
  text: string;
  varaint: keyof typeof colorPalete;
}

export const colorPalete = {
  "1": {
    color: "#000",
    border: "#eee",
  },
  "2": {
    color: "#fff",
    border: "#000",
  },
};

function TestComponent(props: TestProps) {
  const currentVaraint = colorPalete[props.varaint || "1"] || colorPalete["1"];
  return (
    <div
      style={{
        backgroundColor: currentVaraint.color,
        border: `1px solid ${currentVaraint.border}`,
        color: currentVaraint.border,
      }}
    >
      {props.text}
    </div>
  );
}

export default TestComponent;
