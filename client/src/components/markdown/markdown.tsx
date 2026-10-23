import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { isValidElement, type ComponentProps, type ReactNode } from "react";
import "highlight.js/styles/github-dark.css";
import "remark-github-blockquote-alert/alert.css";
import "katex/dist/katex.min.css";
import styles from "./markdown.module.css";

/** Allow raw HTML for `<kbd>`, math elements, and keep class names that alerts/highlighting/katex rely on. */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "math",
    "semantics",
    "mrow",
    "mi",
    "mo",
    "mn",
    "annotation",
    "span",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "style", "aria-hidden"],
  },
};

const LANGUAGE_CLASS = /language-(?<lang>\w+)/;

function codeLanguage(children: ReactNode): string | undefined {
  const first = Array.isArray(children) ? children[0] : children;
  if (!isValidElement(first)) return undefined;
  const { className } = first.props as { className?: string };
  return LANGUAGE_CLASS.exec(className ?? "")?.groups?.lang;
}

function MarkdownImg({ node: _node, ...props }: { node?: unknown } & ComponentProps<"img">) {
  return <img loading="lazy" decoding="async" {...props} />;
}

function MarkdownPre({
  node: _node,
  children,
  ...props
}: { node?: unknown } & ComponentProps<"pre">) {
  const language = codeLanguage(children);
  return (
    <div className={styles["code-block"]}>
      {language && <div className={styles["code-lang"]}>{language}</div>}
      <pre {...props}>{children}</pre>
    </div>
  );
}

function MarkdownKbd({ children, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd className={styles.kbd} {...props}>
      {children}
    </kbd>
  );
}

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkAlert]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeSanitize, sanitizeSchema],
          [rehypeHighlight, { ignoreMissing: true, subset: true }],
        ]}
        components={{
          img: MarkdownImg,
          pre: MarkdownPre,
          kbd: MarkdownKbd,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
