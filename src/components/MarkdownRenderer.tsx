"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-neiro">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            if (isInline) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                language={match[1]}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  background: "var(--surface-raised)",
                  fontSize: "0.8rem",
                  padding: "0.85rem 1rem",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
