import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeHighlight from "rehype-highlight";
import { isValidElement, type ComponentProps, type ReactNode } from "react";
import "highlight.js/styles/github-dark.css";
import "remark-github-blockquote-alert/alert.css";
import styles from "./markdown.module.css";

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

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkAlert]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true, subset: true }]]}
        components={{
          img: MarkdownImg,
          pre: MarkdownPre,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
