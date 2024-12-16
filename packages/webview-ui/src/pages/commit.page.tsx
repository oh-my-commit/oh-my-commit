import { CommitMessage } from "@/components/commit/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { Footer } from "@/components/footer";
import { useCloseWindow } from "@/hooks/use-close-window";
import { vscodeClientLogger } from "@/lib/vscode-client-logger";
import { getVSCodeAPI } from "@/lib/storage";
import {
  changedFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { CommitEvent } from "@oh-my-commits/shared/common";

import { useAtom } from "jotai";
import React, { useEffect } from "react";

interface GitDiffFile {
  file: string;
  changes: number;
  insertions: number;
  deletions: number;
  binary: boolean;
  type: "A" | "D" | "M";
}

export const CommitPage = () => {
  const [title, setTitle] = useAtom(commitTitleAtom);
  const [body, setBody] = useAtom(commitBodyAtom);
  const [changedFiles, setChangedFiles] = useAtom(changedFilesAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom,
  );

  useCloseWindow();

  const handleSetSelectedFiles = (files: string[]) => {
    setSelectedFiles(files);
  };

  const handleSetLastOpenedFilePath = (path: string | null) => {
    setLastOpenedFilePath(path);
  };

  useEffect(() => {
    vscodeClientLogger.info("[useEffect] Setting up message event listener");

    const handleMessage = (event: MessageEvent<CommitEvent>) => {
      const { data } = event;
      switch (data.type) {
        case "diff-summary":
          setChangedFiles(data.diffSummary);
          break;
        case "commit":
          setTitle(data.message.title);
          setBody(data.message.body ?? "");
          break;
        default:
          vscodeClientLogger.info("Unknown event type:", data.type);
      }
    };

    // 添加事件监听器
    window.addEventListener("message", handleMessage);
    vscodeClientLogger.info("[useEffect] Message event listener added");

    // 通知 extension webview 已准备好
    const vscode = getVSCodeAPI();
    vscode.postMessage({ command: "webview-ready" });
    vscodeClientLogger.info("[useEffect] Sent webview-ready message");

    // 清理函数
    return () => {
      vscodeClientLogger.info("[useEffect] Removing message event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // 处理重新生成
  const handleRegenerate = () => {
    const vscode = getVSCodeAPI();
    vscode.postMessage({
      command: "regenerate-commit",
      selectedFiles: selectedFiles,
    });
  };

  vscodeClientLogger.info("[render] == Rendering CommitPage ==");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <CommitMessage onRegenerate={handleRegenerate} />
        <FileChanges
          changedFiles={changedFiles}
          selectedFiles={selectedFiles}
          setSelectedFiles={handleSetSelectedFiles}
          lastOpenedFilePath={lastOpenedFilePath}
          setLastOpenedFilePath={handleSetLastOpenedFilePath}
        />
      </div>
      <Footer />
    </div>
  );
};
