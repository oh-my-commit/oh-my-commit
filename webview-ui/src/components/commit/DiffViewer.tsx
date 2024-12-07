import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { selectedFileAtom } from "../../state/atoms/commit-ui";
import { commitFilesAtom } from "../../state/atoms/commit-core";
import { selectFileAtom } from "../../state/atoms/commit-ui";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface DiffLineProps {
  content: string;
  type: "addition" | "deletion" | "context";
  lineNumber: number;
}

const DiffLine: React.FC<DiffLineProps> = ({ content, type, lineNumber }) => (
  <div className={`diff-line ${type}`}>
    <span className="line-number">{lineNumber}</span>
    <span className="line-content">{content}</span>
  </div>
);

export const DiffViewer: React.FC = () => {
  const [selectedPath] = useAtom(selectedFileAtom);
  const [files] = useAtom(commitFilesAtom);
  const [, selectFile] = useAtom(selectFileAtom);

  const selectedFile = files.find((f) => f.path === selectedPath);

  const { language, processedDiff, lineTypes } = useMemo(() => {
    if (!selectedFile?.diff) {
      return { language: "text", processedDiff: "", lineTypes: [] };
    }

    // Detect file language from extension
    const ext = selectedFile.path.split(".").pop()?.toLowerCase() || "text";
    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      // Add more mappings as needed
    };

    // Process diff to add line classes
    const lines = selectedFile.diff.split("\n");
    const processedLines = lines.map((line) => {
      if (line.startsWith("+")) {
        return { line: line.slice(1), type: "addition" };
      } else if (line.startsWith("-")) {
        return { line: line.slice(1), type: "deletion" };
      }
      return { line, type: "context" };
    });

    return {
      language: languageMap[ext] || "text",
      processedDiff: processedLines.map(({ line }) => line).join("\n"),
      lineTypes: processedLines.map(({ type }) => type),
    };
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="diff-viewer empty">
        <p>Select a file to view changes</p>
      </div>
    );
  }

  const handleClose = () => {
    selectFile("");
  };

  return (
    <div className="grow overflow-hidden h-full flex flex-col">
      <div className="flex-none h-[35px] flex items-center justify-between pl-[20px] pr-2 select-none border-b border-[var(--vscode-panel-border)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span
              className="text-[13px] text-[var(--vscode-editor-foreground)] truncate max-w-[300px]"
              title={selectedFile.path}
            >
              {selectedFile.path.split("/").pop()}
            </span>
            <span className="text-[12px] text-[var(--vscode-descriptionForeground)]">
              {selectedFile.path.split("/").slice(0, -1).join("/")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] tabular-nums">
            <span
              className="text-[var(--vscode-gitDecoration-addedResourceForeground)]"
              title="Lines added"
            >
              +{selectedFile.additions}
            </span>
            <span
              className="text-[var(--vscode-gitDecoration-deletedResourceForeground)]"
              title="Lines removed"
            >
              -{selectedFile.deletions}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <VSCodeButton
            appearance="icon"
            title="Close diff view"
            onClick={handleClose}
          >
            <span className="codicon codicon-close" />
          </VSCodeButton>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={{
            ...vscDarkPlus,
            'pre[class*="language-"]': {
              ...vscDarkPlus['pre[class*="language-"]'],
              background: "transparent",
              margin: 0,
              minWidth: "100%",
            },
            'code[class*="language-"]': {
              ...vscDarkPlus['code[class*="language-"]'],
              background: "transparent",
              color: "var(--vscode-editor-foreground)",
              display: "inline-block",
              minWidth: "100%",
            },
          }}
          showLineNumbers
          customStyle={{
            lineHeight: "20px",
            padding: "12px 0",
            background: "transparent",
            fontFamily: "var(--vscode-editor-font-family)",
            minWidth: "100%",
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
            <code {...props} style={{ 
              display: "block",
              width: "100%",
              fontFamily: "inherit",
              backgroundColor: props.style?.backgroundColor || "transparent",
            }}>
              {children}
            </code>
          )}
          lineProps={(lineNumber) => {
            const type = lineTypes[lineNumber - 1];
            const style: React.CSSProperties = {
              backgroundColor:
                type === "addition"
                  ? "color-mix(in srgb, var(--vscode-diffEditor-insertedLineBackground), transparent 30%)"
                  : type === "deletion"
                  ? "color-mix(in srgb, var(--vscode-diffEditor-removedLineBackground), transparent 30%)"
                  : "var(--vscode-editor-background)",
              display: "block",
              width: "100%",
            };

            return {
              style,
              className:
                "group hover:bg-[color:var(--vscode-editor-hoverHighlightBackground)]",
            };
          }}
          children={processedDiff || "No changes"}
        />
      </div>
    </div>
  );
};
