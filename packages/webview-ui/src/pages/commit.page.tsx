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

import { useAtom, useSetAtom } from "jotai";
import React, { useEffect } from "react";

export const CommitPage = () => {
  const setTitle = useSetAtom(commitTitleAtom);
  const setBody = useSetAtom(commitBodyAtom);
  const setChangedFiles = useSetAtom(changedFilesAtom);

  useCloseWindow();

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

  vscodeClientLogger.info("[CommmitPage]", "== rendered ==");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <CommitMessage />
        <FileChanges />
      </div>
      <Footer />
    </div>
  );
};
