import React, { useCallback } from "react";
import { useCommit } from "../state/hooks/useCommit";
import { FileChanges } from "../components/commit/FileChanges";
import { CommitMessage } from "../components/commit/CommitMessage";
import { getVSCodeAPI } from "../utils/vscode";
import { Footer } from "@/components/footer";

export function CommitPage() {
  const {
    message,
    detail,
    files,
    selectedFiles,
    setMessage,
    setDetail,
    setState,
  } = useCommit();

  const vscode = getVSCodeAPI();

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
        files,
        selectedFiles,
      },
    });
  }, [message, detail, files, selectedFiles]);

  const handleFileSelect = useCallback(
    (path: string) => {
      const newSelectedFiles = selectedFiles.includes(path)
        ? selectedFiles.filter((p) => p !== path)
        : [...selectedFiles, path];
      setState({ selectedFiles: newSelectedFiles });
    },
    [selectedFiles, setState]
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3">
        <CommitMessage
          message={message}
          detail={detail}
          onMessageChange={setMessage}
          onDetailChange={setDetail}
          onCommit={handleCommit}
          selectedFilesCount={selectedFiles.length}
          disabled={!message.trim() || selectedFiles.length === 0}
        />
        <FileChanges
          files={files}
          selectedFiles={selectedFiles}
          setState={setState}
          onFileSelect={handleFileSelect}
        />
      </div>

      <Footer />
    </div>
  );
}
