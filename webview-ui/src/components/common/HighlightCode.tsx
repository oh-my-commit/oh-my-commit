import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "../../lib/utils";

interface HighlightCodeProps {
  code: string;
  language: string;
  highlight?: string;
  lineTypes?: ("addition" | "deletion" | "context")[];
  customStyle?: React.CSSProperties;
}

export const HighlightCode: React.FC<HighlightCodeProps> = ({
  code,
  language,
  highlight = "",
  lineTypes = [],
  customStyle = {},
}) => {
  // 处理代码中的高亮部分
  const processCode = (input: string) => {
    if (!highlight.trim()) return input;

    const regex = new RegExp(`(${highlight})`, "gi");
    return input
      .split("\n")
      .map((line) =>
        line
          .split(regex)
          .map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase()
              ? `<mark class="bg-yellow-500/20 text-inherit rounded px-[2px]">${part}</mark>`
              : part
          )
          .join("")
      )
      .join("\n");
  };

  const highlightedCode = processCode(code);

  return (
    <SyntaxHighlighter
      language={language}
      style={{
        ...vscDarkPlus,
        'pre[class*="language-"]': {
          ...vscDarkPlus['pre[class*="language-"]'],
          background: "transparent",
          margin: 0,
        },
        'code[class*="language-"]': {
          ...vscDarkPlus['code[class*="language-"]'],
          background: "transparent",
          color: "var(--vscode-editor-foreground)",
        },
      }}
      showLineNumbers
      customStyle={{
        lineHeight: "20px",
        padding: "12px 0",
        background: "transparent",
        fontFamily: "var(--vscode-editor-font-family)",
        ...customStyle,
      }}
      lineNumberStyle={{
        minWidth: "3em",
        paddingLeft: "1em",
        paddingRight: "1em",
        textAlign: "right",
        userSelect: "none",
        color: "var(--vscode-editorLineNumber-foreground)",
      }}
      wrapLines={true}
      PreTag={({ children, ...props }) => (
        <pre {...props} style={{ margin: 0, padding: 0 }}>
          {children}
        </pre>
      )}
      CodeTag={({ children, ...props }) => (
        <code
          {...props}
          className={cn("block w-full", props.className)}
          style={{
            fontFamily: "inherit",
            backgroundColor: props.style?.backgroundColor || "transparent",
          }}
        >
          {children}
        </code>
      )}
      lineProps={(lineNumber) => {
        const type = lineTypes[lineNumber - 1];
        return {
          style: {
            display: "block",
            width: "100%",
          },
          className: cn(
            "group",
            type === "addition"
              ? "bg-vscode-diffEditor-insertedTextBackground"
              : type === "deletion"
              ? "bg-vscode-diffEditor-removedTextBackground"
              : "bg-vscode-editor-background",
            "hover:bg-vscode-editor-hoverHighlightBackground"
          ),
        };
      }}
    >
      {highlightedCode}
    </SyntaxHighlighter>
  );
};
