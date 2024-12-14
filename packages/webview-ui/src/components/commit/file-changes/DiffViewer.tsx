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

export const DiffViewer: React.FC<DiffViewerProps> = ({
  files,
  lastOpenedFilePath,
}) => {
  const [wrapLine, setWrapLine] = useAtom(diffWrapLineAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const setLastOpenedFilePath = useSetAtom(lastOpenedFilePathAtom);

  const selectedFile = files?.files?.find(
    (f) => f.path === lastOpenedFilePath
  ) as GitFileChange | undefined;

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

  const lines: string[] = selectedFile.diff.split("\n");

  const handleClose = () => {
    setLastOpenedFilePath("");
  };

  return (
    <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
      <div className="border-b min-w-0">
        <div className="flex items-center justify-between p-2 gap-2">
          <div className="min-w-0">
            <span className="font-medium truncate block">
              {selectedFile.path}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
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
                "rounded-[3px]"
              )}
            >
              <i
                className={cn(
                  "codicon codicon-word-wrap transition-transform",
                  wrapLine && "opacity-100",
                  !wrapLine && "opacity-60 hover:opacity-100"
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
      </div>
      <div className="min-w-0 overflow-auto">
        <table className="w-full border-collapse">
          <tbody
            className={cn(
              "font-mono text-sm",
              wrapLine && "whitespace-pre-wrap",
              !wrapLine && "whitespace-pre"
            )}
          >
            {lines.map((line, index) => {
              const bgColor = line.startsWith("+")
                ? "bg-green-100 dark:bg-green-900"
                : line.startsWith("-")
                ? "bg-red-100 dark:bg-red-900"
                : "";

              return (
                <tr key={index}>
                  <td className={cn("pl-2", bgColor)}>
                    <HighlightText text={line} highlight="" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
