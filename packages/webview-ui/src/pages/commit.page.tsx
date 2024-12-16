import { CommitMessage } from "@/components/commit/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { Footer } from "@/components/footer";
import { useCloseWindow } from "@/hooks/use-close-window";
import { logger } from "@/lib/logger";
import { getVSCodeAPI } from "@/lib/storage";
import {
  changedFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { CommitEvent } from "@oh-my-commits/shared/types";

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
    lastOpenedFilePathAtom
  );

  useCloseWindow();

  const handleSetSelectedFiles = (files: string[]) => {
    setSelectedFiles(files);
  };

  const handleSetLastOpenedFilePath = (path: string | null) => {
    setLastOpenedFilePath(path);
  };

  useEffect(() => {
    logger.info("[useEffect] Setting up message event listener");

    const handleMessage = (event: MessageEvent<CommitEvent>) => {
      logger.info("[handleMessage] Received message event:", event);
      const { data } = event;
      logger.info("[handleMessage] Received message data:", data);
      switch (data.type) {
        case "diff-summary":
          logger.info("[handleMessage] received diff summary: ", data);
          setChangedFiles(data.diffSummary);
          break;
        case "commit":
          logger.info("[handleMessage] received commit message: ", data);
          setTitle(data.message.title);
          setBody(data.message.body ?? "");
          break;
        default:
          logger.info("[handleMessage] Unknown event type:", data.type);
      }
    };

    // 添加事件监听器
    window.addEventListener("message", handleMessage);
    logger.info("[useEffect] Message event listener added");

    // 通知 extension webview 已准备好
    const vscode = getVSCodeAPI();
    vscode.postMessage({ command: "webview-ready" });
    logger.info("[useEffect] Sent webview-ready message");

    // 清理函数
    return () => {
      logger.info("[useEffect] Removing message event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // 处理重新生成
  const handleRegenerate = () => {
    const vscode = getVSCodeAPI();
    vscode.postMessage({ 
      command: "regenerate-commit",
      selectedFiles: selectedFiles
    });
  };

  logger.info("[render] == Rendering CommitPage ==");

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
