import {
  changedFilesAtom,
  lastOpenedFilePathAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { diffWrapLineAtom } from "@/state/atoms/ui";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useAtom, useSetAtom } from "jotai";
import React, { useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { twj } from "tw-to-css";
import { HighlightText } from "@/components/common/HighlightText";
import cn from "classnames";
import { GitChangeSummary, GitFileChange } from "@yaac/shared";

interface DiffViewerProps {
  files: GitChangeSummary | null;
  lastOpenedFilePath: string | null;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ files, lastOpenedFilePath }) => {
  const [wrapLine, setWrapLine] = useAtom(diffWrapLineAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const setLastOpenedFilePath = useSetAtom(lastOpenedFilePathAtom);

  const selectedFile = files?.files?.find((f) => f.path === lastOpenedFilePath) as GitFileChange | undefined;

  if (!selectedFile) {
    return null;
  }

  if (!selectedFile.diff) {
    return (
      <div className="flex items-center justify-center h-full">
        No diff available
      </div>
    );
  }

  const ext = selectedFile.path.split(".").pop()?.toLowerCase() || "text";
  const language = useMemo(() => getLanguageFromExtension(ext), [ext]);

  const renderDiff = () => {
    if (!selectedFile.diff) {
      return null;
    }

    const lines: string[] = selectedFile.diff.split("\n");
    return lines.map((line, index) => {
      let className = "pl-2";
      if (line.startsWith("+")) {
        className += " bg-green-100 dark:bg-green-900";
      } else if (line.startsWith("-")) {
        className += " bg-red-100 dark:bg-red-900";
      }

      return (
        <div key={index} className={className}>
          <HighlightText text={line} highlight="" />
        </div>
      );
    });
  };

  const handleClose = () => {
    setLastOpenedFilePath("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {selectedFile.path}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-green-600 dark:text-green-400">
            +{selectedFile.additions}
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{selectedFile.deletions}
          </span>
          <VSCodeButton
            appearance="icon"
            title={wrapLine ? "Disable Line Wrap" : "Enable Line Wrap"}
            onClick={() => setWrapLine(!wrapLine)}
            className={cn(
              wrapLine && "bg-[var(--vscode-toolbar-activeBackground)]",
              "rounded-[3px]",
            )}
          >
            <i
              className={cn(
                "codicon codicon-word-wrap transition-transform",
                wrapLine && "opacity-100",
                !wrapLine && "opacity-60 hover:opacity-100",
              )}
            />
          </VSCodeButton>
          <VSCodeButton
            appearance="icon"
            title="Close diff view"
            onClick={handleClose}
          >
            <span className="codicon codicon-close" />
          </VSCodeButton>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="font-mono text-sm">{renderDiff()}</div>
      </div>
    </div>
  );
};

const getLanguageFromExtension = (ext: string): string => {
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    // Add more mappings as needed
  };

  return languageMap[ext] || "text";
};
