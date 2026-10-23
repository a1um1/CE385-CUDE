import type * as Monaco from "monaco-editor";

export type HeadingType = "Paragraph" | "Heading 1" | "Heading 2" | "Heading 3" | "Heading 4";
export type AlertType = "None" | "Note" | "Tip" | "Warning" | "Caution" | "Important";

export function detectHeading(trimmed: string): HeadingType {
  if (trimmed.startsWith("#### ")) return "Heading 4";
  if (trimmed.startsWith("### ")) return "Heading 3";
  if (trimmed.startsWith("## ")) return "Heading 2";
  if (trimmed.startsWith("# ")) return "Heading 1";
  return "Paragraph";
}

export function detectAlert(trimmed: string): AlertType {
  if (trimmed.startsWith("> [!NOTE]")) return "Note";
  if (trimmed.startsWith("> [!TIP]")) return "Tip";
  if (trimmed.startsWith("> [!WARNING]")) return "Warning";
  if (trimmed.startsWith("> [!CAUTION]")) return "Caution";
  if (trimmed.startsWith("> [!IMPORTANT]")) return "Important";
  return "None";
}

export function detectInlineFormat(line: string, col: number, selectedText: string) {
  if (selectedText.length > 0) {
    return {
      bold: selectedText.startsWith("**") && selectedText.endsWith("**"),
      italic:
        (selectedText.startsWith("*") &&
          selectedText.endsWith("*") &&
          !selectedText.startsWith("**")) ||
        (selectedText.startsWith("_") && selectedText.endsWith("_")),
      math: selectedText.startsWith("$") && selectedText.endsWith("$"),
      code: selectedText.startsWith("`") && selectedText.endsWith("`"),
    };
  }

  const before = line.substring(Math.max(0, col - 3), col);
  const after = line.substring(col - 1, Math.min(line.length, col + 2));
  return {
    bold: before.endsWith("**") || after.startsWith("**"),
    italic:
      (before.endsWith("*") && !before.endsWith("**")) ||
      (after.startsWith("*") && !after.startsWith("**")),
    math: before.endsWith("$") || after.startsWith("$"),
    code: before.endsWith("`") || after.startsWith("`"),
  };
}

export function executeWrap(
  editor: Monaco.editor.IStandaloneCodeEditor,
  wrap: string,
  defaultText: string,
) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  if (!selection || !model) return;

  const selected = model.getValueInRange(selection);
  if (selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length >= wrap.length * 2) {
    const unwrapped = selected.slice(wrap.length, selected.length - wrap.length);
    editor.executeEdits("markdown-editor", [
      { range: selection, text: unwrapped, forceMoveMarkers: true },
    ]);
  } else {
    const col = selection.startColumn;
    const lineNum = selection.startLineNumber;
    const line = model.getLineContent(lineNum);
    const wLen = wrap.length;
    const left = line.substring(col - 1 - wLen, col - 1);
    const right = line.substring(col - 1, col - 1 + wLen);

    if (selected.length === 0 && left === wrap && right === wrap) {
      editor.executeEdits("markdown-editor", [
        {
          range: {
            startLineNumber: lineNum,
            startColumn: col - wLen,
            endLineNumber: lineNum,
            endColumn: col + wLen,
          },
          text: "",
          forceMoveMarkers: true,
        },
      ]);
    } else {
      editor.executeEdits("markdown-editor", [
        {
          range: selection,
          text: `${wrap}${selected || defaultText}${wrap}`,
          forceMoveMarkers: true,
        },
      ]);
    }
  }
}

export function executeHeading(
  editor: Monaco.editor.IStandaloneCodeEditor,
  type: HeadingType,
  currentHeading: HeadingType,
) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  if (!selection || !model) return;

  const lineNum = selection.positionLineNumber;
  const lineContent = model.getLineContent(lineNum);
  const cleanLine = lineContent.replace(/^#{1,6}\s*/, "");

  const hashPrefix =
    type === "Heading 1"
      ? "# "
      : type === "Heading 2"
        ? "## "
        : type === "Heading 3"
          ? "### "
          : type === "Heading 4"
            ? "#### "
            : "";

  const newLine =
    type === currentHeading || type === "Paragraph"
      ? cleanLine
      : `${hashPrefix}${cleanLine || "Heading"}`;

  editor.executeEdits("markdown-editor", [
    {
      range: {
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: lineContent.length + 1,
      },
      text: newLine,
      forceMoveMarkers: true,
    },
  ]);
}

export function executeAlert(
  editor: Monaco.editor.IStandaloneCodeEditor,
  type: AlertType,
  currentAlert: AlertType,
) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  if (!selection || !model) return;

  const lineNum = selection.positionLineNumber;
  const lineContent = model.getLineContent(lineNum);

  const newLine =
    type === currentAlert || type === "None"
      ? lineContent.replace(/^>\s*\[!(?<type>NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/i, "")
      : `> [!${type.toUpperCase()}]\n> ${lineContent.replace(/^>\s*/, "") || "Content here"}`;

  editor.executeEdits("markdown-editor", [
    {
      range: {
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: lineContent.length + 1,
      },
      text: newLine,
      forceMoveMarkers: true,
    },
  ]);
}

export function executeLinePrefix(
  editor: Monaco.editor.IStandaloneCodeEditor,
  prefix: string,
  isCurrentlyActive: boolean,
) {
  const selection = editor.getSelection();
  const model = editor.getModel();
  if (!selection || !model) return;

  const lineNum = selection.positionLineNumber;
  const line = model.getLineContent(lineNum);

  let newLine = "";
  if (isCurrentlyActive) {
    newLine =
      prefix === "1. "
        ? line.replace(/^\d+\.\s*/, "")
        : line.replace(new RegExp(`^\\${prefix.trim()}\\s*`), "");
  } else {
    const clean = line.replace(/^(?<lead>[-*>]|\d+\.)\s*/, "");
    newLine = `${prefix}${clean || "item"}`;
  }

  editor.executeEdits("markdown-editor", [
    {
      range: {
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: line.length + 1,
      },
      text: newLine,
      forceMoveMarkers: true,
    },
  ]);
}

export function executeInsertBlock(
  editor: Monaco.editor.IStandaloneCodeEditor,
  blockContent: string,
) {
  const selection = editor.getSelection();
  if (!selection) return;

  editor.executeEdits("markdown-editor", [
    { range: selection, text: `\n${blockContent}\n`, forceMoveMarkers: true },
  ]);
}
