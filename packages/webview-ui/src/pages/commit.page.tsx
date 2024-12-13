import { Footer } from "@/components/footer";
import {
  stagedFilesAtom,
  selectedFilesAtom,
  unstagedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import {
  commitDetailAtom,
  commitMessageAtom,
} from "@/state/atoms/commit.message";
import { getVSCodeAPI } from "@/lib/storage";
import { useAtom } from "jotai";
import React, { useCallback, useEffect } from "react";
import { CommitMessage } from "@/components/commit/core/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { uiModeAtom } from "@/state/atoms/ui";

export function CommitPage() {
  const [message, setMessage] = useAtom(commitMessageAtom);
  const [detail, setDetail] = useAtom(commitDetailAtom);
  const [stagedFiles, setStagedFiles] = useAtom(stagedFilesAtom);
  const [unstagedFiles, setUnstagedFiles] = useAtom(unstagedFilesAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [uiMode] = useAtom(uiModeAtom);

  const vscode = getVSCodeAPI();

  useEffect(() => {
    // Handle window close button in window mode
    if (uiMode === "window") {
      const handleClose = () => {
        vscode.postMessage({ type: "window-close" });
      };

      // Listen for the close button click
      window.addEventListener("beforeunload", handleClose);
      return () => window.removeEventListener("beforeunload", handleClose);
    }
  }, [uiMode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "init":
          setStagedFiles(message.stagedFiles.files);
          setUnstagedFiles(message.unstagedFiles.files);
          setSelectedFiles(message.stagedFiles.files || []); // Auto-select all staged files initially
          break;
        case "update-files":
          setStagedFiles(message.stagedFiles.files);
          setUnstagedFiles(message.unstagedFiles.files);
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    // Request initial files
    vscode.postMessage({ command: "get-files" });

    return () => window.removeEventListener("message", handleMessage);
  }, [setStagedFiles, setUnstagedFiles, setSelectedFiles]);

  const handleCommit = useCallback(() => {
    if (!message.trim()) {
      vscode.postMessage({
        command: "showError",
        data: "Please enter a commit message",
      });
      return;
    }

    vscode.postMessage({
      command: "commit",
      data: {
        message,
        detail,
        stagedFiles,
        unstagedFiles,
        selectedFiles,
      },
    });
  }, [message, detail, stagedFiles, unstagedFiles, selectedFiles]);

  const handleFileSelect = useCallback(
    (path: string, isStaged: boolean) => {
      const newSelectedFiles = selectedFiles.includes(path)
        ? selectedFiles.filter((p) => p !== path)
        : [...selectedFiles, path];
      setSelectedFiles(newSelectedFiles);
    },
    [selectedFiles]
  );

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 mx-auto max-w-[1080px]">
      <CommitMessage
        message={message}
        detail={detail}
        onMessageChange={setMessage}
        onDetailChange={setDetail}
        onCommit={handleCommit}
        selectedFilesCount={selectedFiles.length}
        disabled={!message.trim() || selectedFiles.length === 0}
      />

      {/* {uiMode === "panel" && ( */}
      <>
        <FileChanges
          stagedFiles={stagedFiles}
          unstagedFiles={unstagedFiles}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
        />

        <Footer />
      </>
      {/* )} */}
    </div>
  );
}
