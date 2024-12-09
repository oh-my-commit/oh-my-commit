import React, { useCallback } from "react";
import { useCommit } from "../state/hooks/useCommit";
import { FileChanges } from "../components/commit/file-changes/FileChanges";
import { CommitMessage } from "../components/commit/CommitMessage";
import { getVSCodeAPI } from "../utils/vscode";
import { Footer } from "@/components/footer";
import { Section } from "@/components/layout/Section";

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
    <div className="flex flex-col h-full gap-4 mx-auto max-w-[1080px]">
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

      <Footer />
    </div>
  );
}
