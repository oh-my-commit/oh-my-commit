import { CommitMessage } from "@/components/commit/core/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { Footer } from "@/components/footer";
import { useCloseWindow } from "@/hooks/use-close-window";
import {
  changedFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { CommitEvent } from "@yaac/shared/types/commit";
import { GitChangeType, GitChangeSummary, GitFileChange } from "@yaac/shared";
import type { DiffResultTextFile } from "simple-git";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { logger } from "@/lib/logger";
import { getVSCodeAPI } from "@/lib/storage";

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
    logger.info("Setting up message event listener");

    const handleMessage = (event: MessageEvent<CommitEvent>) => {
      logger.info("Received message event:", event);
      const { data } = event;
      switch (data.type) {
        case "commit":
          logger.info("received commit event: ", data);
          if (data.message.isOk()) {
            setTitle(data.message.value.title);
            setBody(data.message.value.body ?? "");
            if (data.diffSummary.files) {
              setChangedFiles(data.diffSummary);
            }
          }
          break;
        default:
          logger.info("Unknown event type:", data.type);
      }
    };

    // 添加事件监听器
    window.addEventListener("message", handleMessage);
    logger.info("Message event listener added");

    // 通知 VSCode 扩展 webview 已准备就绪
    const vscode = getVSCodeAPI();
    vscode.postMessage({ command: "webview-ready" });
    logger.info("Sent webview-ready message");

    // 清理函数
    return () => {
      logger.info("Removing message event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <CommitMessage />
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
