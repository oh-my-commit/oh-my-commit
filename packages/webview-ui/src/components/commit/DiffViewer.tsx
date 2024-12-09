import {
  commitFilesAtom,
  lastOpenedFilePathAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { twj } from "tw-to-css";
import { HighlightText } from "../common/HighlightText";

export const DiffViewer: React.FC = () => {
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(
    lastOpenedFilePathAtom,
  );
  const [files] = useAtom(commitFilesAtom);
  const [searchQuery] = useAtom(searchQueryAtom);

  const selectedFile = files.find((f) => f.path === lastOpenedFilePath);

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
    const lines: string[] = selectedFile.diff.split("\n");
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
    setLastOpenedFile("");
  };

  return (
    <div className="grow overflow-hidden h-full flex flex-col">
      <div className="flex-none h-[35px] flex items-center justify-between pl-[20px] pr-2 select-none border-b border-panel-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-sidebar-title">
              Changes
            </span>
            <span className="text-[11px] opacity-80">
              ({selectedFile.path})
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] tabular-nums">
            <span className="text-git-added-fg" title="Lines added">
              +{selectedFile.additions}
            </span>
            <span className="text-git-deleted-fg" title="Lines removed">
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
          wrapLines={true}
          renderer={({ rows, stylesheet, useInlineStyles }: any) => {
            const renderNode = (
              node: any,
              searchText?: string,
            ): React.ReactNode => {
              if (node.type === "text") {
                if (searchText) {
                  return (
                    <HighlightText
                      text={String(node.value || "")}
                      highlight={searchText}
                    />
                  );
                }
                return node.value;
              }

              if (node.tagName) {
                const props: any = { ...node.properties };
                if (useInlineStyles) {
                  props.style = props.style || {};
                } else {
                  props.className = props.className?.join(" ");
                }

                return React.createElement(
                  node.tagName,
                  props,
                  node.children?.map((child: any, i: number) => (
                    <React.Fragment key={i}>
                      {renderNode(child, searchText)}
                    </React.Fragment>
                  )),
                );
              }

              return null;
            };

            return (
              <pre
                className={"leading-[20px] py-3"}
                style={stylesheet['pre[class*="language-"]']}
              >
                <code style={stylesheet['code[class*="language-"]']}>
                  {rows.map((row: { children?: any[] }, i: number) => {
                    const type = lineTypes[i];
                    const lineProps = {
                      key: i,
                      style: {
                        display: "block",
                        width: "100%",
                        backgroundColor:
                          type === "addition"
                            ? "var(--vscode-diffEditor-insertedTextBackground)"
                            : type === "deletion"
                              ? "var(--vscode-diffEditor-removedTextBackground)"
                              : "",
                      },
                      className: "group hover:bg-editor-line-highlight",
                    };

                    return (
                      <div {...lineProps}>
                        {row.children?.map((child: any, j: number) => (
                          <React.Fragment key={j}>
                            {renderNode(child, searchQuery || undefined)}
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  })}
                </code>
              </pre>
            );
          }}
          customStyle={{}}
          showLineNumbers
          lineNumberStyle={twj(
            "min-w-[3em] pl-4 pr-4 text-right select-none text-editor-line-number",
          )}
          style={vscDarkPlus}
          children={processedDiff || "No changes"}
        />
      </div>
    </div>
  );
};
