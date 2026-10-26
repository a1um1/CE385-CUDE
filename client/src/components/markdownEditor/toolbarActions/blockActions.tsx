import { List, ListOrdered, Quote, Link, Table } from "lucide-react";
import { useMarkdownEditor } from "../editorContext";
import { ToolbarButton } from "./actionItem";

export function BulletListAction() {
  const { isList, toggleLinePrefix } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isList}
      title="Bullet list (- )"
      onClick={() => toggleLinePrefix("- ", isList)}
    >
      <List size={15} />
    </ToolbarButton>
  );
}

export function NumberedListAction() {
  const { isNumList, toggleLinePrefix } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isNumList}
      title="Numbered list (1. )"
      onClick={() => toggleLinePrefix("1. ", isNumList)}
    >
      <ListOrdered size={15} />
    </ToolbarButton>
  );
}

export function QuoteAction() {
  const { isQuote, toggleLinePrefix } = useMarkdownEditor();
  return (
    <ToolbarButton
      active={isQuote}
      title="Quote (> )"
      onClick={() => toggleLinePrefix("> ", isQuote)}
    >
      <Quote size={15} />
    </ToolbarButton>
  );
}

export function LinkAction() {
  const { toggleInline } = useMarkdownEditor();
  return (
    <ToolbarButton title="Link" onClick={() => toggleInline("[", "](https://example.com)")}>
      <Link size={15} />
    </ToolbarButton>
  );
}

export function TableAction() {
  const { insertBlock } = useMarkdownEditor();
  return (
    <ToolbarButton
      title="Table"
      onClick={() =>
        insertBlock("| Column 1 | Column 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |")
      }
    >
      <Table size={15} />
    </ToolbarButton>
  );
}
