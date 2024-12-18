import { CommitMessage } from "@/components/commit/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { Footer } from "@/components/footer";
import { useCloseWindow } from "@/hooks/use-close-window";
import { vscodeClientLogger } from "@/lib/vscode-client-logger";
import { diffResultAtom } from "@/state/atoms/commit.changed-files";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { ClientMessageEvent, ServerMessageEvent } from "@oh-my-commits/shared";

import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

export const CommitPage = () => {
  const setTitle = useSetAtom(commitTitleAtom);
  const setBody = useSetAtom(commitBodyAtom);
  const setDiffResult = useSetAtom(diffResultAtom);

  useCloseWindow();

  useEffect(() => {
    vscodeClientLogger.info("[useEffect] Setting up message event listener");

    const handleMessage = (event: ServerMessageEvent) => {
      switch (event.type) {
        case "diff-result":
          setDiffResult(event.data);
          break;
        case "commit-message":
          const { data } = event;
          if (data.code === 0) {
            setTitle(data.title);
            setBody(data.body ?? "");
          }
          break;
        case "commit-result":
          break;
        case "pong":
          break;
        default:
          vscodeClientLogger.info("Unknown event:", event);
          return;
      }
    };

    window.addEventListener("message", handleMessage);

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
