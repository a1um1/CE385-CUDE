import { Bold, Italic, Code, Sigma } from "lucide-react";
import { useMarkdownEditor } from "../editorContext";
import { ToolbarButton } from "./actionItem";

export function BoldAction() {
  const { isBold, toggleInline } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isBold}
      title="Bold (**text**)"
      onClick={() => toggleInline("**", "bold text")}
    >
      <Bold size={15} />
    </ToolbarButton>
  );
}

export function ItalicAction() {
  const { isItalic, toggleInline } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isItalic}
      title="Italic (*text*)"
      onClick={() => toggleInline("*", "italic text")}
    >
      <Italic size={15} />
    </ToolbarButton>
  );
}

export function MathAction() {
  const { isMath, toggleInline } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isMath}
      title="Math ($formula$)"
      onClick={() => toggleInline("$", "x^2 + y^2 = z^2")}
    >
      <Sigma size={15} />
    </ToolbarButton>
  );
}

export function CodeAction() {
  const { isCode, toggleInline } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isCode}
      title="Inline code (`code`)"
      onClick={() => toggleInline("`", "code")}
    >
      <Code size={15} />
    </ToolbarButton>
  );
}
