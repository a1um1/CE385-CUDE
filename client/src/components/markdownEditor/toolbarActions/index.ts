import type { ComponentType } from "react";
import { HeadingAction } from "./headingAction";
import { BoldAction, ItalicAction, MathAction, CodeAction } from "./formatActions";
import {
  BulletListAction,
  NumberedListAction,
  QuoteAction,
  LinkAction,
  TableAction,
} from "./blockActions";
import { AlertNoteAction } from "./alertAction";

export * from "./actionItem";
export * from "./headingAction";
export * from "./formatActions";
export * from "./blockActions";
export * from "./alertAction";
export * from "./windowActions";

export interface ToolbarActionConfig {
  id: string;
  component: ComponentType;
}

export const DEFAULT_TOOLBAR_ACTIONS: ToolbarActionConfig[] = [
  { id: "heading", component: HeadingAction },
  { id: "bold", component: BoldAction },
  { id: "italic", component: ItalicAction },
  { id: "math", component: MathAction },
  { id: "code", component: CodeAction },
  { id: "bullet-list", component: BulletListAction },
  { id: "numbered-list", component: NumberedListAction },
  { id: "quote", component: QuoteAction },
  { id: "link", component: LinkAction },
  { id: "table", component: TableAction },
  { id: "alert-note", component: AlertNoteAction },
];
